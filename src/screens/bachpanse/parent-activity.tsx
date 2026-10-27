import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useApp } from "@/lib/bachpanse/store";
import { inr, formatDay, formatTime, dayGroupLabel, monthLabel } from "@/lib/bachpanse/format";
import type { Transaction } from "@/lib/bachpanse/types";
import { BottomSheet, Chip, EmptyArt } from "@/components/bachpanse/ui";
import { AppHeader, TransactionRow } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";

export function ParentActivityScreen() {
  const { data } = useApp();
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [detail, setDetail] = useState<Transaction | null>(null);

  const monthDate = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const filtered = useMemo(() => {
    return data.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === monthDate.getMonth() &&
          d.getFullYear() === monthDate.getFullYear()
        );
      })
      .filter((t) => filter === "all" || t.type === filter)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [data.transactions, filter, monthDate]);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = dayGroupLabel(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <Screen>
      <AppHeader title="Activity" subtitle="All money in and money out" />
      <ScrollArea className="px-4 pb-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
          {(
            [
              ["all", "All"],
              ["in", "Money in"],
              ["out", "Money out"],
            ] as const
          ).map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-card px-3 py-2 shadow-sm">
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-soft text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[14px] font-extrabold">{monthLabel(monthDate.toISOString())}</span>
          <button
            disabled={monthOffset >= 0}
            onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-soft text-primary disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center pt-10">
            <EmptyArt className="w-48" />
            <p className="mt-2 text-[13px] font-semibold text-muted-foreground">
              No entries this month yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(([day, items]) => (
              <div key={day}>
                <p className="mb-1.5 px-1 text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  {day}
                </p>
                <div className="space-y-2">
                  {items.map((t) => (
                    <TransactionRow key={t.id} t={t} onClick={() => setDetail(t)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <BottomSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? (detail.type === "in" ? "Money in" : "Money out") : ""}
      >
        {detail && (
          <div className="space-y-3 pb-3">
            <div className="rounded-2xl bg-violet-soft p-4 text-center">
              <p className="font-display text-3xl font-extrabold text-primary">
                {inr(detail.amount)}
              </p>
              <p className="text-[12px] font-semibold text-primary/70">
                {formatDay(detail.date)} · {formatTime(detail.date)}
              </p>
            </div>
            {[
              ["Title", detail.note],
              ["Category", detail.category],
              ["Recorded by", detail.recordedBy],
              ["Type", detail.type === "in" ? "Money in" : "Money out"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-xl bg-muted px-3.5 py-2.5 text-[13px]">
                <span className="font-semibold text-muted-foreground">{k}</span>
                <span className="max-w-[60%] truncate text-right font-bold">{v}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-xl bg-sunny-soft px-3.5 py-2.5">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <p className="text-[12px] font-semibold text-foreground">
                Parents can view entries but cannot edit or delete a child's
                entries.
              </p>
            </div>
          </div>
        )}
      </BottomSheet>
    </Screen>
  );
}
