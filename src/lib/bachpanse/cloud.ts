import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContentData } from "./content";
import type { AppData } from "./types";

/**
 * Thin Supabase layer shared by the PWA and the admin panel. Everything is a
 * no-op when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing, so the app
 * still runs as the original local-only prototype.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null =
  cloudEnabled && url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;

/* ---------- content <-> rows ---------- */

export type ContentKind = "module" | "lesson" | "quiz" | "challenge";

export interface ContentRow {
  kind: ContentKind;
  id: string;
  status: "published" | "draft";
  payload: unknown;
}

export function contentToRows(c: ContentData): ContentRow[] {
  return [
    ...c.modules.map((m) => ({ kind: "module" as const, id: String(m.id), status: m.status, payload: m })),
    ...c.lessons.map((l) => ({ kind: "lesson" as const, id: l.id, status: l.status, payload: l })),
    ...c.quizzes.map((q) => ({ kind: "quiz" as const, id: q.id, status: q.status, payload: q })),
    ...c.challenges.map((h) => ({ kind: "challenge" as const, id: h.id, status: h.status, payload: h })),
  ];
}

export function rowsToContent(rows: Pick<ContentRow, "kind" | "payload">[]): ContentData {
  const out: ContentData = { modules: [], lessons: [], quizzes: [], challenges: [] };
  for (const r of rows) {
    if (r.kind === "module") out.modules.push(r.payload as ContentData["modules"][number]);
    else if (r.kind === "lesson") out.lessons.push(r.payload as ContentData["lessons"][number]);
    else if (r.kind === "quiz") out.quizzes.push(r.payload as ContentData["quizzes"][number]);
    else out.challenges.push(r.payload as ContentData["challenges"][number]);
  }
  return out;
}

const rowKey = (r: Pick<ContentRow, "kind" | "id">) => `${r.kind}:${r.id}`;

export async function fetchContentRows(): Promise<ContentRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("content_items").select("kind,id,status,payload");
  if (error) throw new Error(error.message);
  return (data ?? []) as ContentRow[];
}

/** Writes only what changed between two snapshots (admin only; enforced by RLS). */
export async function pushContentDiff(prev: ContentData, next: ContentData): Promise<void> {
  if (!supabase) return;
  const before = new Map(contentToRows(prev).map((r) => [rowKey(r), r]));
  const after = new Map(contentToRows(next).map((r) => [rowKey(r), r]));

  const upserts: (ContentRow & { updated_at: string })[] = [];
  const now = new Date().toISOString();
  for (const [k, row] of after) {
    const old = before.get(k);
    if (!old || old.status !== row.status || JSON.stringify(old.payload) !== JSON.stringify(row.payload)) {
      upserts.push({ ...row, updated_at: now });
    }
  }
  const removed = [...before.entries()].filter(([k]) => !after.has(k)).map(([, r]) => r);

  if (upserts.length > 0) {
    const { error } = await supabase.from("content_items").upsert(upserts, { onConflict: "kind,id" });
    if (error) throw new Error(error.message);
  }
  for (const r of removed) {
    const { error } = await supabase.from("content_items").delete().eq("kind", r.kind).eq("id", r.id);
    if (error) throw new Error(error.message);
  }
}

/* ---------- families (PWA progress, read by the admin) ---------- */

export type FamilySnapshot = Omit<AppData, "content">;

export interface FamilyRow {
  owner: string;
  phone: string;
  parent_name: string;
  child_name: string;
  data: FamilySnapshot;
  updated_at: string;
}

export async function ensureDeviceSession(): Promise<string | null> {
  if (!supabase) return null;
  const existing = await supabase.auth.getSession();
  if (existing.data.session) return existing.data.session.user.id;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(error.message);
  return data.user?.id ?? null;
}

export async function upsertFamily(
  owner: string,
  phone: string,
  snapshot: FamilySnapshot
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("families").upsert(
    {
      owner,
      phone,
      parent_name: snapshot.parentName,
      child_name: snapshot.childName,
      data: snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner" }
  );
  if (error) throw new Error(error.message);
}

export async function fetchFamilies(): Promise<FamilyRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("families")
    .select("owner,phone,parent_name,child_name,data,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FamilyRow[];
}

/* ---------- admin auth ---------- */

async function isAdminUser(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !error && data !== null;
}

export async function adminSignIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user || !(await isAdminUser(data.user.id))) {
    await supabase.auth.signOut();
    throw new Error("This account is not an admin. Ask an owner to add you to the admins table.");
  }
}

/** True when a previous admin session is still valid. */
export async function restoreAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user || user.is_anonymous) return false;
  return isAdminUser(user.id);
}

export async function adminSignOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

/* ---------- realtime ---------- */

export function subscribeTable(table: "content_items" | "families", onChange: () => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`rt-${table}-${Math.random().toString(36).slice(2, 8)}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
