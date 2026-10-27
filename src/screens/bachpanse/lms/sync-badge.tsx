import { cn } from "@/lib/utils";
import { useSyncStatus, type SyncState } from "@/lib/bachpanse/sync";

const LABEL: Record<SyncState, string> = {
  off: "Local only (no Supabase)",
  connecting: "Connecting…",
  synced: "All changes saved",
  saving: "Saving…",
  error: "Sync problem",
};

const DOT: Record<SyncState, string> = {
  off: "bg-muted-foreground",
  connecting: "bg-sunny",
  synced: "bg-mint",
  saving: "bg-sunny",
  error: "bg-coral",
};

export function SyncBadge() {
  const state = useSyncStatus((s) => s.state);
  const message = useSyncStatus((s) => s.message);
  return (
    <div className="text-[10px] font-semibold leading-relaxed text-muted-foreground" title={message}>
      <span className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", DOT[state])} />
        {LABEL[state]}
      </span>
      {state === "error" && message && <span className="mt-1 block text-coral">{message}</span>}
    </div>
  );
}
