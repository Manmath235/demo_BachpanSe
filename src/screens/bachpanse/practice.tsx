import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, ShoppingBasket, PiggyBank } from "lucide-react";
import { useApp, useToast, useComingSoon, getShopChallenge, getSaveChallenge } from "@/lib/bachpanse/store";
import { inr } from "@/lib/bachpanse/format";
import { Button, InfoPill, ProgressRing } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";

/* ---------- Practice home ---------- */
export function PracticeHomeScreen() {
  const { data, back, go } = useApp();
  const openSheet = useComingSoon();
  const shop = getShopChallenge(data);
  const save = getSaveChallenge(data);
  return (
    <Screen>
      <AppHeader title="Practice" subtitle="Games that teach money" onBack={back} />
      <ScrollArea className="space-y-4 px-4 pb-6">
        <div className="flex items-center gap-2 rounded-2xl bg-sunny-soft p-3.5">
          <Info className="h-5 w-5 shrink-0 text-foreground" />
          <p className="text-[13px] font-extrabold text-foreground">
            Practice money: not real. Coins here are just for learning!
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-mint to-[oklch(0.72_0.15_180)] p-4 text-primary-foreground shadow-lg shadow-mint/30">
          <ProgressRing progress={1} size={56} color="var(--primary-foreground)" stroke={7}>
            <span className="text-2xl">🪙</span>
          </ProgressRing>
          <div>
            <p className="text-[12px] font-bold opacity-90">Practice coins</p>
            <p className="font-display text-2xl font-extrabold">{data.practiceCoins}</p>
          </div>
          <InfoPill tone="mint" className="ml-auto">
            Not real
          </InfoPill>
        </div>

        {shop && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => go("practiceShop")}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-soft text-2xl">
              <ShoppingBasket className="h-6 w-6 text-coral" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-extrabold">{shop.name}</p>
              <p className="text-[12px] text-muted-foreground">
                {shop.budget}-coin budget · {shop.items.length} items
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </motion.button>
        )}

        {save && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => go("practiceSave")}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-soft text-2xl">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-extrabold">{save.name}</p>
              <p className="text-[12px] text-muted-foreground">
                {save.scenarios.length} scenarios · make the smart call
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </motion.button>
        )}

        {!shop && !save && (
          <p className="rounded-2xl bg-card p-4 text-center text-[13px] text-muted-foreground shadow-sm">
            No practice games published yet — check back soon!
          </p>
        )}

        <div>
          <h3 className="mb-2 px-1 text-[15px] font-extrabold">Recent results</h3>
          <div className="space-y-2">
            {data.practiceHistory.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-card px-3.5 py-2.5 shadow-sm">
                <span className="text-[13px] font-bold">
                  {p.challenge === "shop" ? "🛒 Shop smart" : "🐷 Save or spend"}
                </span>
                <span className="text-[13px] font-extrabold text-primary">
                  {p.score}/{p.max}
                </span>
              </div>
            ))}
            {data.practiceHistory.length === 0 && (
              <p className="px-1 text-[12px] text-muted-foreground">
                Play a challenge to see results here!
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => openSheet.openSheet("More practice games like 'Detect the scam' come in a later phase!")}
          className="w-full py-2 text-center text-[12px] font-semibold text-muted-foreground underline"
        >
          More games coming soon
        </button>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Shop smart ---------- */
export function PracticeShopScreen() {
  const back = useApp((s) => s.back);
  const data = useApp((s) => s.data);
  const savePracticeFn = useApp((s) => s.savePractice);
  const toast = useToast((s) => s.show);
  const challenge = getShopChallenge(data);

  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);

  if (!challenge) {
    return (
      <Screen>
        <AppHeader title="Shop smart" onBack={back} />
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-[14px] text-muted-foreground">This challenge is not published right now.</p>
        </div>
      </Screen>
    );
  }

  const BUDGET = challenge.budget;
  const ITEMS = challenge.items;
  const spent = ITEMS.filter((i) => picked.includes(i.id)).reduce((a, i) => a + i.price, 0);
  const remaining = BUDGET - spent;

  const toggle = (id: string) => {
    const item = ITEMS.find((i) => i.id === id)!;
    if (picked.includes(id)) setPicked(picked.filter((p) => p !== id));
    else if (item.price <= remaining) setPicked([...picked, id]);
  };

  const finish = () => {
    const needs = ITEMS.filter((i) => i.need);
    const bought = ITEMS.filter((i) => picked.includes(i.id));
    let score = 10;
    for (const n of needs) if (!picked.includes(n.id)) score -= 2;
    const wants = bought.filter((i) => !i.need).length;
    if (wants > 2) score -= (wants - 2) * 2;
    if (spent > BUDGET) score -= 2;
    score = Math.max(1, score);
    savePracticeFn("shop", score, 10);
    setResult(score);
    toast("Result saved — your parent can see it!", "🛒");
  };

  if (result !== null) {
    const bought = ITEMS.filter((i) => picked.includes(i.id));
    const missedNeeds = ITEMS.filter((i) => i.need && !picked.includes(i.id));
    return (
      <Screen>
        <AppHeader title={`${challenge.name} — result`} onBack={back} />
        <ScrollArea className="flex flex-col items-center px-6 pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="mt-4"
          >
            <ProgressRing progress={result / 10} size={110} stroke={10} color={result >= 8 ? "var(--mint)" : "var(--sunny)"}>
              <div className="text-center">
                <p className="font-display text-2xl font-extrabold">{result}/10</p>
                <p className="text-[10px] font-bold text-muted-foreground">score</p>
              </div>
            </ProgressRing>
          </motion.div>
          <div className="mt-5 w-full space-y-2">
            <p className="rounded-2xl bg-violet-soft px-4 py-3 text-[13px] font-semibold text-primary">
              You bought {bought.length} items with {inr(spent)} of your {BUDGET}-coin
              budget.
            </p>
            {missedNeeds.length > 0 ? (
              <p className="rounded-2xl bg-coral-soft px-4 py-3 text-[13px] font-semibold text-coral">
                You missed {missedNeeds.length} need{missedNeeds.length > 1 ? "s" : ""}:{" "}
                {missedNeeds.map((n) => n.name).join(", ")}. {challenge.scoringMessage}
              </p>
            ) : (
              <p className="rounded-2xl bg-mint-soft px-4 py-3 text-[13px] font-semibold text-primary">
                All needs covered — smart shopping! 🎉
              </p>
            )}
            <p className="text-center text-[12px] font-semibold text-muted-foreground">
              Results feed your parent's "Practice activity" section.
            </p>
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={back}>
            Back to practice
          </Button>
        </ScrollArea>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title={challenge.name} subtitle={`Budget ${BUDGET} coins`} onBack={back} />
      <ScrollArea className="px-4 pb-6">
        <div className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-lg">
          <div>
            <p className="text-[11px] font-bold opacity-80">Remaining coins</p>
            <motion.p
              key={remaining}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-display text-2xl font-extrabold"
            >
              {remaining}
            </motion.p>
          </div>
          <Button size="sm" variant="sunny" disabled={picked.length === 0} onClick={finish}>
            Finish shopping
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map((item) => {
            const selected = picked.includes(item.id);
            const tooPoor = !selected && item.price > remaining;
            return (
              <motion.button
                key={item.id}
                {...(tooPoor ? {} : { whileTap: { scale: 0.95 } })}
                onClick={() => toggle(item.id)}
                className={`flex flex-col items-center rounded-2xl p-3.5 text-center shadow-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : tooPoor
                      ? "bg-card opacity-50"
                      : "bg-card"
                }`}
              >
                <span className="text-3xl">{item.emoji}</span>
                <p className={`mt-1 text-[13px] font-extrabold ${selected ? "" : "text-foreground"}`}>
                  {item.name}
                </p>
                <p className={`text-[12px] font-bold ${selected ? "opacity-90" : "text-primary"}`}>
                  🪙 {item.price}
                </p>
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selected ? "bg-white/20" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.need ? "Need?" : "Want?"}
                </span>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
          Think: is it something you truly need, or a nice-to-have want?
        </p>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Save or spend ---------- */
export function PracticeSaveScreen() {
  const back = useApp((s) => s.back);
  const data = useApp((s) => s.data);
  const savePracticeFn = useApp((s) => s.savePractice);
  const toast = useToast((s) => s.show);
  const challenge = getSaveChallenge(data);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!challenge) {
    return (
      <Screen>
        <AppHeader title="Save or spend" onBack={back} />
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-[14px] text-muted-foreground">This challenge is not published right now.</p>
        </div>
      </Screen>
    );
  }

  const SCENARIOS = challenge.scenarios;
  const maxScore = SCENARIOS.length;
  const s = SCENARIOS[idx]!;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (SCENARIOS[idx]!.options[i]!.good) setScore((v) => v + 1);
  };

  const next = () => {
    if (idx < SCENARIOS.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      const finalScore = score + (picked !== null && SCENARIOS[idx]!.options[picked]!.good ? 1 : 0);
      savePracticeFn("save", finalScore, maxScore);
      setScore(finalScore);
      setDone(true);
      toast("Result saved — your parent can see it!", "🐷");
    }
  };

  if (done) {
    return (
      <Screen>
        <AppHeader title={`${challenge.name} — result`} onBack={back} />
        <ScrollArea className="flex flex-col items-center px-6 pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-violet-soft text-5xl"
          >
            {score === maxScore ? "🏆" : score >= maxScore - 1 ? "🌟" : "💪"}
          </motion.div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            {score}/{maxScore} smart choices
          </h2>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            {score === maxScore
              ? "Perfect! You think like a money pro."
              : score >= maxScore - 1
                ? "Great thinking — almost all smart calls!"
                : challenge.scoringMessage}
          </p>
          <Button size="lg" className="mt-8 w-full" onClick={back}>
            Back to practice
          </Button>
        </ScrollArea>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title={challenge.name} subtitle={`Scenario ${idx + 1} of ${SCENARIOS.length}`} onBack={back} />
      <ScrollArea className="px-5 pb-6">
        <div className="mt-2 flex justify-center gap-1.5">
          {SCENARIOS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i <= idx ? "w-5 bg-primary" : "w-1.5 bg-primary/25"}`}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col items-center text-center">
          <span className="text-5xl">{s.emoji}</span>
          <p className="mt-3 text-[15px] font-bold leading-relaxed">{s.q}</p>
        </div>
        <div className="mt-5 space-y-3">
          {s.options.map((o, i) => {
            const chosen = picked === i;
            const show = picked !== null;
            return (
              <motion.button
                key={i}
                {...(show ? {} : { whileTap: { scale: 0.97 } })}
                onClick={() => pick(i)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-[14px] font-bold transition-colors ${
                  show
                    ? o.good
                      ? "border-mint bg-mint-soft text-primary"
                      : chosen
                        ? "border-coral bg-coral-soft text-coral"
                        : "border-border opacity-60"
                    : "border-border bg-card"
                }`}
              >
                {o.text}
              </motion.button>
            );
          })}
        </div>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl bg-violet-soft p-4"
          >
            <p className="text-[13px] font-bold text-primary">
              {s.options[picked]!.good ? "✅ Smart choice!" : "🤔 Let's learn from this:"}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-primary/80">
              {s.options[picked]!.outcome}
            </p>
            <Button size="lg" className="mt-3 w-full" onClick={next}>
              {idx < SCENARIOS.length - 1 ? "Next scenario" : "See my result"}
            </Button>
          </motion.div>
        )}
      </ScrollArea>
    </Screen>
  );
}
