import { create } from "zustand";
import { useApp } from "./store";
import { seedContent, type ContentData } from "./content";
import {
  cloudEnabled,
  ensureDeviceSession,
  fetchContentRows,
  pushContentDiff,
  rowsToContent,
  subscribeTable,
  upsertFamily,
  type FamilySnapshot,
} from "./cloud";

export type SyncState = "off" | "connecting" | "synced" | "saving" | "error";

interface SyncStatus {
  state: SyncState;
  message: string;
  set: (state: SyncState, message?: string) => void;
}

export const useSyncStatus = create<SyncStatus>((set) => ({
  state: cloudEnabled ? "connecting" : "off",
  message: "",
  set: (state, message = "") => set({ state, message }),
}));

let applyingRemote = false;

function applyRemoteContent(content: ContentData) {
  applyingRemote = true;
  try {
    useApp.setState((s) => ({ data: { ...s.data, content } }));
  } finally {
    applyingRemote = false;
  }
}

function debounce(fn: () => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
  run.cancel = () => clearTimeout(t);
  return run;
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/**
 * PWA: pulls published content from Supabase (and keeps it fresh), and pushes the
 * family's progress up so the admin panel can see it. Returns a cleanup function.
 */
export function startPwaSync(): () => void {
  const status = useSyncStatus.getState();
  if (!cloudEnabled) {
    status.set("off");
    return () => {};
  }
  let stopped = false;
  let owner: string | null = null;

  const pullContent = async () => {
    try {
      const rows = await fetchContentRows();
      // An empty table means the admin has not published anything yet: keep the bundled content.
      if (!stopped && rows.length > 0) applyRemoteContent(rowsToContent(rows));
      if (!stopped) useSyncStatus.getState().set("synced");
    } catch (e) {
      if (!stopped) useSyncStatus.getState().set("error", errMsg(e));
    }
  };
  const pullDebounced = debounce(() => void pullContent(), 400);

  let lastSent = "";
  const pushProgress = async () => {
    const { data, session } = useApp.getState();
    if (!session.signedIn || stopped) return;
    const { content: _content, ...snapshot } = data;
    const json = JSON.stringify({ phone: session.phone, snapshot });
    if (json === lastSent) return;
    try {
      owner ??= await ensureDeviceSession();
      if (!owner) return;
      await upsertFamily(owner, session.phone, snapshot as FamilySnapshot);
      lastSent = json;
    } catch (e) {
      useSyncStatus.getState().set("error", errMsg(e));
    }
  };
  const pushDebounced = debounce(() => void pushProgress(), 1500);

  void (async () => {
    try {
      owner = await ensureDeviceSession();
    } catch (e) {
      useSyncStatus.getState().set("error", errMsg(e));
    }
    await pullContent();
    void pushProgress();
  })();

  const unsubStore = useApp.subscribe((s, prev) => {
    if (s.data !== prev.data || s.session !== prev.session) pushDebounced();
  });
  const unsubRealtime = subscribeTable("content_items", pullDebounced);
  const onVisible = () => {
    if (document.visibilityState === "visible") pullDebounced();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", pullDebounced);
  const poll = setInterval(pullDebounced, 60_000);

  return () => {
    stopped = true;
    unsubStore();
    unsubRealtime();
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", pullDebounced);
    clearInterval(poll);
    pullDebounced.cancel();
    pushDebounced.cancel();
  };
}

/**
 * Admin panel: Supabase is the source of truth for content. Every edit made through the
 * store actions is diffed and written back; edits from other admins arrive via realtime.
 */
export function startAdminSync(): () => void {
  if (!cloudEnabled) {
    useSyncStatus.getState().set("off");
    return () => {};
  }
  let stopped = false;
  const status = useSyncStatus.getState();
  status.set("connecting");

  // Serialise writes so rapid edits land in order.
  let chain: Promise<void> = Promise.resolve();
  let pending = 0;
  const enqueue = (prev: ContentData, next: ContentData) => {
    pending++;
    useSyncStatus.getState().set("saving");
    chain = chain
      .then(() => pushContentDiff(prev, next))
      .then(() => {
        pending--;
        if (!stopped && pending === 0) useSyncStatus.getState().set("synced");
      })
      .catch((e) => {
        pending--;
        if (!stopped) useSyncStatus.getState().set("error", errMsg(e));
      });
  };

  const pull = async (seedIfEmpty: boolean) => {
    try {
      const rows = await fetchContentRows();
      if (stopped) return;
      if (rows.length === 0 && seedIfEmpty) {
        const seed = seedContent();
        applyRemoteContent(seed);
        enqueue({ modules: [], lessons: [], quizzes: [], challenges: [] }, seed);
        return;
      }
      if (pending === 0) applyRemoteContent(rowsToContent(rows));
      useSyncStatus.getState().set("synced");
    } catch (e) {
      if (!stopped) useSyncStatus.getState().set("error", errMsg(e));
    }
  };
  void pull(true);

  const unsubStore = useApp.subscribe((s, prev) => {
    if (applyingRemote) return;
    if (s.data.content !== prev.data.content) enqueue(prev.data.content, s.data.content);
  });
  const unsubRealtime = subscribeTable(
    "content_items",
    debounce(() => void pull(false), 500)
  );

  return () => {
    stopped = true;
    unsubStore();
    unsubRealtime();
  };
}
