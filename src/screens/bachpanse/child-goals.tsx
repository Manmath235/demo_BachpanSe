import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, PartyPopper } from "lucide-react";
import { useApp, selectBalance, useToast, useFx } from "@/lib/bachpanse/store";
import { inr, daysAgoISO } from "@/lib/bachpanse/format";
import { Button, BottomSheet, Keypad, Chip } from "@/components/bachpanse/ui";
import { AppHeader, GoalCard } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls } from "./shared";
import type { Goal } from "@/lib/bachpanse/types";

const GOAL_EMOJIS = ["🏏", "🎁", "🚲", "📚", "🎮", "👟", "🎨", "⚽"];

export function ChildGoalsScreen() {
  const { data, back } = useApp();
  const { createGoal, addToGoal } = useApp();
  const toast = useToast((s) => s.show);
  const fire = useFx((s) => s.fire);

  const [newGoal, setNewGoal] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏏");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState(daysAgoISO(-30).slice(0, 10));

  const [goalSheet, setGoalSheet] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");

  const balance = selectBalance(data);

  const saveGoal = () => {
    const t = parseInt(target || "0", 10);
    if (!name.trim() || !t) return;
    createGoal({
      name: name.trim(),
      emoji,
      target: t,
      targetDate: new Date(targetDate + "T12:00:00").toISOString(),
    });
    setNewGoal(false);
    setName("");
    setTarget("");
    toast("New goal created", "🎯");
  };

  const addMoney = () => {
    if (!goalSheet) return;
    const a = parseInt(amount || "0", 10);
    if (!a) return;
    const reached = addToGoal(goalSheet.id, a);
    setGoalSheet(null);
    setAmount("");
    if (reached) {
      fire();
      toast("Goal reached! Badge unlocked", "🏆");
    } else {
      toast(`Added to ${goalSheet.name}`, "🎯");
    }
  };

  return (
    <Screen>
      <AppHeader
        title="Goals"
        subtitle="Save bit by bit for what you love"
        right={
          <Button size="sm" onClick={() => setNewGoal(true)}>
            <Plus className="h-4 w-4" /> New
          </Button>
        }
      />
      <ScrollArea className="space-y-3 px-4 pb-6">
        <div className="flex items-center justify-between rounded-2xl bg-violet-soft p-3.5">
          <p className="text-[13px] font-bold text-primary">Available balance</p>
          <p className="font-display text-lg font-extrabold text-primary">{inr(balance)}</p>
        </div>
        {data.goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            action={
              <Button size="sm" variant="mint" onClick={() => setGoalSheet(g)}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            }
          />
        ))}
      </ScrollArea>

      {/* New goal */}
      <BottomSheet open={newGoal} onClose={() => setNewGoal(false)} title="New goal">
        <div className="space-y-4 pb-2">
          <Field label="What are you saving for?">
            <input
              className={inputCls}
              placeholder="e.g. New football shoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-bold">Pick an emoji</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-colors ${
                    emoji === e ? "bg-primary" : "bg-violet-soft"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[13px] font-bold">Target amount</p>
            <Keypad value={target} onChange={setTarget} prefix="₹" maxLength={6} />
          </div>
          <Field label="Target date">
            <input type="date" className={inputCls} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </Field>
          <Button size="lg" className="w-full" disabled={!name.trim() || !target} onClick={saveGoal}>
            Create goal
          </Button>
        </div>
      </BottomSheet>

      {/* Add to goal */}
      <BottomSheet
        open={!!goalSheet}
        onClose={() => setGoalSheet(null)}
        title={goalSheet ? `Add to ${goalSheet.name}` : ""}
      >
        {goalSheet && (
          <div className="space-y-4 pb-2">
            <div className="flex items-center justify-between rounded-2xl bg-violet-soft px-4 py-3">
              <span className="text-[13px] font-bold text-primary">Saved so far</span>
              <span className="font-display font-extrabold text-primary">
                {inr(goalSheet.saved)} / {inr(goalSheet.target)}
              </span>
            </div>
            <Keypad value={amount} onChange={setAmount} prefix="₹" maxLength={6} />
            <div className="flex gap-2">
              {[100, 250, 500].map((q) => (
                <Chip key={q} onClick={() => setAmount(String(q))}>
                  +{q}
                </Chip>
              ))}
            </div>
            <Button size="lg" className="w-full" disabled={!amount} onClick={addMoney}>
              <PartyPopper className="h-4 w-4" /> Move to goal
            </Button>
          </div>
        )}
      </BottomSheet>
    </Screen>
  );
}
