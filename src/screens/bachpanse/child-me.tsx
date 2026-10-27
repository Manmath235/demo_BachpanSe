import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Flame,
  Star,
  Trophy,
  ShieldCheck,
  KeyRound,
  HelpCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { childAge } from "@/lib/bachpanse/types";
import { BADGES } from "@/lib/bachpanse/lessons";
import { Button, BottomSheet, InfoPill } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";
import { PinPad } from "./child-onboarding";

export function ChildMeScreen() {
  const { data, back, go, setRole, reset, logout } = useApp();
  const toast = useToast((s) => s.show);
  const [help, setHelp] = useState(false);
  const age = childAge(data.childDob);

  return (
    <Screen>
      <AppHeader title="Me" />
      <ScrollArea className="space-y-4 px-4 pb-6">
        {/* Profile card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.62_0.21_270)] p-5 text-primary-foreground shadow-lg shadow-primary/30">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl">
              {data.childAvatar}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-extrabold">{data.childName}</p>
              <p className="text-[12px] opacity-80">Age {age} · learning with Mom & Dad</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2 text-[13px] font-extrabold">
              <Flame className="h-4 w-4" /> {data.streak} day streak
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2 text-[13px] font-extrabold">
              <Star className="h-4 w-4" /> {data.points} points
            </div>
          </div>
        </div>

        {/* Badges */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => go("badges")}
          className="flex w-full items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sunny-soft">
              <Trophy className="h-5 w-5 text-sunny" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-extrabold">My badges</p>
              <p className="text-[11px] text-muted-foreground">
                {data.unlockedBadges.length} of {BADGES.length} unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {data.unlockedBadges.slice(0, 3).map((id) => {
              const b = BADGES.find((x) => x.id === id);
              return b ? <span key={id} className="text-xl">{b.emoji}</span> : null;
            })}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </motion.button>

        <div className="space-y-2">
          <MenuRow
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            label="My privacy"
            onClick={() => go("childPrivacy")}
          />
          <MenuRow
            icon={<KeyRound className="h-5 w-5 text-primary" />}
            label="Change PIN"
            onClick={() => go("changePin")}
          />
          <MenuRow
            icon={<HelpCircle className="h-5 w-5 text-primary" />}
            label="Help"
            onClick={() => setHelp(true)}
          />
        </div>

        <div className="space-y-2">
          <Button
            variant="soft"
            className="w-full"
            onClick={() => {
              setRole("parent");
              reset("parentHome");
            }}
          >
            <RefreshCw className="h-4 w-4" /> Switch to Parent demo
          </Button>
          <Button
            variant="outline"
            className="w-full border-coral/40 text-coral"
            onClick={() => {
              logout();
              toast("Logged out of demo", "👋");
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </ScrollArea>

      <BottomSheet open={help} onClose={() => setHelp(false)} title="Help">
        <div className="space-y-2 pb-2">
          {[
            ["How do I earn points?", "Complete lessons, quizzes, daily challenges and tasks!"],
            ["What are practice coins?", "They're pretend money for games — never real."],
            ["Who can see my entries?", "You and your parent. That's it."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-xl bg-muted px-3.5 py-2.5">
              <p className="text-[13px] font-bold">{q}</p>
              <p className="text-[12px] text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </BottomSheet>
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm"
    >
      {icon}
      <span className="flex-1 text-[14px] font-bold">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* ---------- My privacy ---------- */
export function ChildPrivacyScreen() {
  const { data, back } = useApp();
  return (
    <Screen>
      <AppHeader title="My privacy" onBack={back} />
      <ScrollArea className="space-y-3 px-5 pb-8">
        <div className="rounded-2xl bg-violet-soft p-4 text-center">
          <span className="text-4xl">🛡️</span>
          <p className="mt-2 text-[14px] font-extrabold text-primary">
            Your data, explained simply
          </p>
        </div>
        {[
          ["What is saved about me", "Your name, age, avatar, learning progress and the money entries you record. That's all."],
          ["Who can see it", "You and your parent (" + data.parentName + "). Nobody else — not friends, not companies."],
          ["What we never do", "No ads for kids. No selling data. No following you around the internet."],
          ["Your PIN", "Your 4-digit PIN is secret. Never share it — not even with friends!"],
          ["Want it gone?", "Your parent can withdraw consent anytime, and everything would be deleted."],
        ].map(([t, d], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-card p-4 shadow-sm"
          >
            <p className="text-[14px] font-extrabold">{t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
          </motion.div>
        ))}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold text-muted-foreground">
            Prototype: all data stays in this browser.
          </p>
        </div>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Change PIN ---------- */
export function ChangePinScreen() {
  const { back } = useApp();
  const setPin = useApp((s) => s.setPin);
  const toast = useToast((s) => s.show);
  const [pin, setPinState] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const stage = confirm === null ? "set" : "confirm";

  return (
    <Screen>
      <AppHeader title="Change PIN" onBack={back} />
      <ScrollArea className="flex flex-col px-8 pb-8">
        <p className="mt-2 text-center font-display text-lg font-extrabold">
          {stage === "set" ? "Choose a new 4-digit PIN" : "Confirm your new PIN"}
        </p>
        <div className="mt-4 flex justify-center gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full ${
                (stage === "set" ? pin : confirm || "").length > i
                  ? error
                    ? "bg-coral"
                    : "bg-primary"
                  : "bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="mt-2 text-center text-[12px] font-bold text-coral">
            PINs don't match — try again
          </p>
        )}
        <div className="mt-6">
          <PinPad
            value={stage === "set" ? pin : confirm || ""}
            onChange={(v) => {
              if (stage === "set") {
                setPinState(v);
                if (v.length === 4) setTimeout(() => setConfirm(""), 250);
              } else {
                setConfirm(v);
                if (v.length === 4) {
                  if (v === pin) {
                    setPin();
                    toast("PIN updated", "🔐");
                    setTimeout(back, 400);
                  } else {
                    setError(true);
                    setTimeout(() => {
                      setError(false);
                      setConfirm("");
                    }, 700);
                  }
                }
              }
            }}
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-center">
          <Sparkles className="h-3.5 w-3.5 text-sunny" />
          <p className="text-[11px] font-semibold text-muted-foreground">
            Avoid 1234 or your birthday!
          </p>
        </div>
      </ScrollArea>
    </Screen>
  );
}
