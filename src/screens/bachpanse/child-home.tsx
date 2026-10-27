import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ListChecks, Gamepad2, Flame, Star, BookOpen, Play } from "lucide-react";
import { useApp, monthTotals, selectBalance, useToast, useComingSoon } from "@/lib/bachpanse/store";
import { todayISO } from "@/lib/bachpanse/format";
import { MODULES, DAILY_CHALLENGES } from "@/lib/bachpanse/lessons";
import { Button, BottomSheet, InfoPill } from "@/components/bachpanse/ui";
import { AppHeader, BalanceCard, TaskCard } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, useSkeleton } from "./shared";
import { DashboardSkeleton } from "@/components/bachpanse/ui";
import { AddSpendingSheet } from "./child-money";

export function ChildHomeScreen() {
  const { data, go, reset } = useApp();
  const toast = useToast((s) => s.show);
  const openSheet = useComingSoon((s) => s.openSheet);
  const loading = useSkeleton();
  const [spend, setSpend] = useState(false);

  const balance = selectBalance(data);
  const totals = monthTotals(data);
  const firstName = data.childName.split(" ")[0];

  // continue learning: first module with lessonsDone < 3
  const nextModuleIdx = Math.max(0, data.modules.findIndex((m) => m.lessonsDone < 3));
  const nextModule = MODULES[nextModuleIdx]!;
  const lessonIdx = data.modules[nextModuleIdx]?.lessonsDone ?? 0;

  // daily challenge
  const dayIndex = new Date().getDate() % DAILY_CHALLENGES.length;
  const challenge = DAILY_CHALLENGES[dayIndex]!;
  const [picked, setPicked] = useState<number | null>(null);
  const claimed = data.lastDailyClaim === todayISO();

  const answer = (i: number) => {
    setPicked(i);
    if (i === challenge.answer) {
      if (!claimed) {
        useApp.getState().claimDaily();
        toast("+20 points! Daily challenge done", "⭐");
      } else {
        toast("Already claimed today — come back tomorrow!", "📅");
      }
    }
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader title={`Hi ${firstName}!`} />
        <DashboardSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title={`Hi ${firstName}! 👋`}
        subtitle="Ready to grow your money?"
        right={
          <div className="flex items-center gap-2">
            <InfoPill tone="coral">
              <Flame className="h-3 w-3" /> {data.streak}
            </InfoPill>
            <InfoPill tone="sunny">
              <Star className="h-3 w-3" /> {data.points}
            </InfoPill>
            <button
              onClick={() => openSheet("Choosing a different avatar comes in a later phase — you picked yours during sign-up!")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl shadow-sm"
            >
              {data.childAvatar}
            </button>
          </div>
        }
      />
      <ScrollArea className="space-y-4 px-4 pb-6">
        <BalanceCard balance={balance} moneyIn={totals.moneyIn} moneyOut={totals.moneyOut} />

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSpend(true)}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-coral p-3 text-primary-foreground shadow-md shadow-coral/30"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[11px] font-extrabold">Add spending</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => go("childTasks")}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-primary p-3 text-primary-foreground shadow-md shadow-primary/30"
          >
            <ListChecks className="h-5 w-5" />
            <span className="text-[11px] font-extrabold">My tasks</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => go("practiceHome")}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-mint p-3 text-primary-foreground shadow-md shadow-mint/30"
          >
            <Gamepad2 className="h-5 w-5" />
            <span className="text-[11px] font-extrabold">Practice</span>
          </motion.button>
        </div>

        {/* Continue learning */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            go("moduleDetail", { moduleId: nextModule.id })
          }
          className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.62_0.21_270)] p-4 text-left text-primary-foreground shadow-lg shadow-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            {nextModule.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
              Continue learning
            </p>
            <p className="truncate font-display text-[15px] font-extrabold">
              {nextModule.title} · Lesson {lessonIdx + 1}
            </p>
          </div>
          <Play className="h-5 w-5 shrink-0" />
        </motion.button>

        {/* Daily challenge */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              🎯 Daily challenge
            </h3>
            <InfoPill tone={claimed ? "mint" : "sunny"}>
              {claimed ? "+20 claimed" : "+20 points"}
            </InfoPill>
          </div>
          <p className="mt-2 text-[14px] font-bold">{challenge.q}</p>
          <div className="mt-2 space-y-2">
            {challenge.options.map((o, i) => {
              const isPicked = picked === i;
              const correct = i === challenge.answer;
              return (
                <button
                  key={i}
                  disabled={picked !== null && (claimed || i === challenge.answer || isPicked)}
                  onClick={() => answer(i)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                    picked !== null && correct
                      ? "bg-mint-soft text-primary"
                      : isPicked
                        ? "bg-coral-soft text-coral"
                        : "bg-muted hover:bg-violet-soft"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 rounded-xl bg-violet-soft px-3 py-2 text-[12px] font-semibold text-primary"
            >
              {challenge.explain}
            </motion.p>
          )}
        </div>

        {/* Tasks teaser */}
        <div className="flex items-center justify-between rounded-2xl bg-sunny-soft p-4">
          <div>
            <p className="text-[14px] font-extrabold">Tasks from Mom & Dad</p>
            <p className="text-[12px] font-semibold text-foreground/70">
              {data.tasks.filter((t) => t.status !== "completed").length} waiting for you
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={() => go("childTasks")}>
            <BookOpen className="h-4 w-4" /> Open
          </Button>
        </div>
      </ScrollArea>

      <AddSpendingSheet open={spend} onClose={() => setSpend(false)} />
    </Screen>
  );
}

/* ---------- Child tasks ---------- */
export function ChildTasksScreen() {
  const { data, back, reset } = useApp();
  const { childMarkDone } = useApp();
  const toast = useToast((s) => s.show);

  const done = (id: string) => {
    childMarkDone(id);
    toast("Marked as done — waiting for parent", "⏳");
  };

  return (
    <Screen>
      <AppHeader title="My tasks" subtitle="Earn rewards from your parents" onBack={back} />
      <ScrollArea className="space-y-2 px-4 pb-6">
        {data.tasks.map((t) => (
          <TaskCard key={t.id} task={t}>
            {t.status === "todo" && (
              <Button size="sm" className="w-full" onClick={() => done(t.id)}>
                ✅ Mark as done
              </Button>
            )}
            {t.status === "completed" && (
              <div className="rounded-xl bg-mint-soft px-3 py-2 text-center text-[13px] font-extrabold text-primary">
                🎉 Reward earned: ₹{t.reward}
              </div>
            )}
          </TaskCard>
        ))}
        <button
          onClick={() => reset("childHome")}
          className="w-full py-3 text-center text-[13px] font-bold text-primary"
        >
          ← Back to home
        </button>
      </ScrollArea>
    </Screen>
  );
}
