import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Info, Flame, Star, BookOpen, Gamepad2 } from "lucide-react";
import { useApp, monthTotals, selectBalance, useToast, useComingSoon } from "@/lib/bachpanse/store";
import { inr, todayISO } from "@/lib/bachpanse/format";
import { MODULES } from "@/lib/bachpanse/lessons";
import {
  Button,
  BottomSheet,
  Keypad,
  Chip,
  DashboardSkeleton,
  InfoPill,
} from "@/components/bachpanse/ui";
import {
  AppHeader,
  BalanceCard,
  TransactionRow,
  GoalCard,
} from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls, useSkeleton } from "./shared";

export function ParentHomeScreen() {
  const { data, reset, go } = useApp();
  const addMoneyIn = useApp((s) => s.addMoneyIn);
  const toast = useToast((s) => s.show);
  const openSheet = useComingSoon((s) => s.openSheet);
  const loading = useSkeleton();

  const [sheet, setSheet] = useState(false);
  const [info, setInfo] = useState(false);
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState("Pocket money");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO().slice(0, 10));

  const balance = selectBalance(data);
  const totals = monthTotals(data);
  const recent = [...data.transactions].slice(0, 5);
  const lessonsDone = data.modules.reduce((a, m) => a + m.lessonsDone, 0);

  const save = () => {
    const amt = parseInt(amount || "0", 10);
    if (!amt) return;
    addMoneyIn({ amount: amt, category: kind, note: note.trim() || kind, date: new Date(date + "T12:00:00").toISOString() });
    setSheet(false);
    setAmount("");
    setNote("");
    toast("Money added", "💰");
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Home" subtitle={data.parentName} />
        <DashboardSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title={data.parentName}
        subtitle={`Child: ${data.childName}`}
        right={
          <div className="flex flex-col items-end gap-1">
            <InfoPill tone="sunny" onClick={() => setInfo(true)}>
              👁 View only <Info className="h-3 w-3" />
            </InfoPill>
          </div>
        }
      />
      <ScrollArea className="space-y-4 px-4 pb-6">
        <BalanceCard
          balance={balance}
          moneyIn={totals.moneyIn}
          moneyOut={totals.moneyOut}
          title={`${data.childName.split(" ")[0]}'s balance · this month`}
        />
        <Button size="lg" className="w-full" onClick={() => setSheet(true)}>
          <Plus className="h-5 w-5" /> Send Money
        </Button>

        {/* Learning progress */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-extrabold">Learning progress</h3>
            <button
              className="text-[12px] font-bold text-primary"
              onClick={() => openSheet("Detailed learning reports come in a later phase.")}
            >
              Reports soon
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-violet-soft px-3 py-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[13px] font-extrabold text-primary">{lessonsDone}/18</p>
                <p className="text-[10px] font-semibold text-primary/70">lessons</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-coral-soft px-3 py-2">
              <Flame className="h-4 w-4 text-coral" />
              <div>
                <p className="text-[13px] font-extrabold text-coral">{data.streak} days</p>
                <p className="text-[10px] font-semibold text-coral/70">streak</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-sunny-soft px-3 py-2">
              <Star className="h-4 w-4 text-sunny" />
              <div>
                <p className="text-[13px] font-extrabold text-foreground">{data.points}</p>
                <p className="text-[10px] font-semibold text-foreground/60">points</p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {MODULES.map((m, i) => {
              const prog = data.modules[i]!;
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="w-5 text-center text-[13px]">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span className="truncate">{m.title}</span>
                      <span>{prog.lessonsDone}/3</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-violet-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(prog.lessonsDone / 3) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.06 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals */}
        <div>
          <h3 className="mb-2 px-1 text-[15px] font-extrabold">Goals</h3>
          <div className="space-y-2">
            {data.goals.map((g) => (
              <GoalCard key={g.id} goal={g} onClick={() => reset("parentActivity")} />
            ))}
          </div>
        </div>

        {/* Practice */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <Gamepad2 className="h-4 w-4 text-primary" /> Practice activity
            </h3>
            <InfoPill tone="mint">Practice money, not real</InfoPill>
          </div>
          <p className="mt-2 text-[13px] font-bold text-foreground">
            🪙 {inr(data.practiceCoins).replace("₹", "")} practice coins
          </p>
          <div className="mt-2 space-y-1.5">
            {data.practiceHistory.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-[12px] font-semibold">
                <span>{p.challenge === "shop" ? "🛒 Shop smart" : "🐷 Save or spend"}</span>
                <span className="font-extrabold text-primary">
                  Score {p.score}/{p.max}
                </span>
              </div>
            ))}
            {data.practiceHistory.length === 0 && (
              <p className="text-[12px] text-muted-foreground">No practice runs yet.</p>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-[15px] font-extrabold">Recent transactions</h3>
            <button
              onClick={() => reset("parentActivity")}
              className="text-[13px] font-bold text-primary"
            >
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                t={t}
                onClick={() => go("parentActivity")}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Record money given */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Record money given">
        <div className="space-y-4 pb-2">
          <Keypad value={amount} onChange={setAmount} prefix="₹" />
          <div>
            <p className="mb-1.5 text-[13px] font-bold">Type</p>
            <div className="flex gap-2">
              {["Pocket money", "Gift", "Other"].map((k) => (
                <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                  {k}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="Note">
            <input
              className={inputCls}
              placeholder={kind === "Gift" ? "Birthday gift from Nani" : "Monthly pocket money"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button size="lg" className="w-full" disabled={!amount} onClick={save}>
            Save money in
          </Button>
        </div>
      </BottomSheet>

      {/* View-only info */}
      <BottomSheet open={info} onClose={() => setInfo(false)} title="View only mode">
        <p className="pb-2 text-[14px] leading-relaxed text-muted-foreground">
          You can see your child's activity, learning and practice results. You
          cannot approve or block their spending — BachpanSe keeps the child in
          charge of small money decisions while you watch the big picture.
        </p>
      </BottomSheet>
    </Screen>
  );
}
