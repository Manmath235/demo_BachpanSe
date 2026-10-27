import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useApp } from "@/lib/bachpanse/store";
import {
  cloudEnabled,
  fetchFamilies,
  subscribeTable,
  type FamilyRow,
  type FamilySnapshot,
} from "@/lib/bachpanse/cloud";
import { LmsButton } from "./ui";

const balanceOf = (d: FamilySnapshot) =>
  d.transactions.reduce((sum, t) => sum + (t.type === "in" ? t.amount : -t.amount), 0);
const lessonsOf = (d: FamilySnapshot) => d.modules.reduce((sum, m) => sum + m.lessonsDone, 0);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

/** Read-only view of what children are doing in the PWA. */
export function LearnersPage() {
  const localData = useApp((s) => s.data);
  const [rows, setRows] = useState<FamilyRow[]>([]);
  const [loading, setLoading] = useState(cloudEnabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!cloudEnabled) return;
    setLoading(true);
    try {
      setRows(await fetchFamilies());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load learners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeTable("families", () => void load());
  }, [load]);

  const families: FamilyRow[] = cloudEnabled
    ? rows
    : [
        {
          owner: "local",
          phone: localData.parentPhone,
          parent_name: localData.parentName,
          child_name: localData.childName,
          data: localData,
          updated_at: new Date().toISOString(),
        },
      ];

  const totalLessons = families.reduce((sum, f) => sum + lessonsOf(f.data), 0);
  const totalPoints = families.reduce((sum, f) => sum + f.data.points, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold">Learners</h1>
          <p className="text-[12px] font-semibold text-muted-foreground">
            Progress synced from the BachpanSe app. Read-only.
          </p>
        </div>
        {cloudEnabled && (
          <LmsButton variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </LmsButton>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Families" value={families.length} />
        <Stat label="Lessons completed" value={totalLessons} />
        <Stat label="Points earned" value={totalPoints} />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-coral-soft px-3 py-2 text-[12px] font-semibold text-coral">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Child</th>
              <th className="px-4 py-2.5">Parent</th>
              <th className="px-4 py-2.5">Lessons</th>
              <th className="px-4 py-2.5">Points</th>
              <th className="px-4 py-2.5">Badges</th>
              <th className="px-4 py-2.5">Balance</th>
              <th className="px-4 py-2.5">Open tasks</th>
              <th className="px-4 py-2.5">Last active</th>
            </tr>
          </thead>
          <tbody>
            {families.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No families have signed in to the app yet."}
                </td>
              </tr>
            )}
            {families.map((f) => (
              <tr key={f.owner} className="border-t border-border hover:bg-violet-soft/30">
                <td className="px-4 py-2.5 font-bold">{f.child_name || "—"}</td>
                <td className="px-4 py-2.5">
                  {f.parent_name || "—"}
                  <span className="block text-[11px] text-muted-foreground">{f.phone}</span>
                </td>
                <td className="px-4 py-2.5">{lessonsOf(f.data)}</td>
                <td className="px-4 py-2.5">{f.data.points}</td>
                <td className="px-4 py-2.5">{f.data.unlockedBadges.length}</td>
                <td className="px-4 py-2.5">{inr(balanceOf(f.data))}</td>
                <td className="px-4 py-2.5">
                  {f.data.tasks.filter((t) => t.status !== "completed").length}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(f.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
