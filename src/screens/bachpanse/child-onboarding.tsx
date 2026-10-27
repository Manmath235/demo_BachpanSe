import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, ArrowRight, Check } from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import logoAsset from "@/assets/bachpanse-logo.png.asset.json";
import { Button, CodeBoxes } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Logo, logoFallback } from "./shared";

/* ---------- Enter invite code ---------- */
export function ChildCodeScreen() {
  const { go } = useApp();
  const [code, setCode] = useState("");
  return (
    <Screen>
      <AppHeader title="Join BachpanSe" onBack={() => go("roleSelect")} />
      <ScrollArea className="px-6 pb-8">
        <div className="pt-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-soft text-3xl">
            🎟️
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            Enter your invite code
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Ask your parent for the 6-character code.
          </p>
          <p className="mt-2 inline-block rounded-full bg-sunny-soft px-3 py-1 text-[12px] font-bold">
            Demo: any 6 characters work
          </p>
        </div>
        <div className="mt-6">
          <CodeBoxes
            length={6}
            value={code}
            onChange={setCode}
            boxClass="uppercase"
          />
        </div>
        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={code.length !== 6}
          onClick={() => go("childWelcome")}
        >
          Join <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="mt-6 text-center">
          <Button variant="soft" onClick={() => go("childScan")}>
            <ScanLine className="h-4 w-4" /> Scan QR instead
          </Button>
        </div>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Mock QR scanner ---------- */
export function ChildScanScreen() {
  const { go, back } = useApp();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen>
      <AppHeader title="Scan QR" onBack={back} />
      <ScrollArea className="flex flex-col items-center px-6 pb-8">
        <div className="relative mt-4 flex h-64 w-64 items-center justify-center overflow-hidden rounded-3xl bg-foreground/80">
          <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-white/95">
            <img
              src={logoAsset.url}
              alt="BachpanSe — Money Wise!"
              className="h-24 w-auto"
              onError={logoFallback}
            />
          </div>
          {!done && (
            <motion.div
              animate={{ top: ["12%", "85%", "12%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-4 right-4 h-0.5 bg-mint shadow-[0_0_12px_var(--mint)]"
            />
          )}
          <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-mint/60" />
        </div>
        <p className="mt-4 text-center text-[13px] font-semibold text-muted-foreground">
          Point the camera at your parent's QR code
        </p>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 rounded-full bg-mint px-4 py-2 font-bold text-primary-foreground">
              <Check className="h-4 w-4" /> QR found!
            </div>
            <Button size="lg" className="mt-4 w-56" onClick={() => go("childWelcome")}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Welcome Divya ---------- */
export function ChildWelcomeScreen() {
  const { data, go } = useApp();
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-mint-soft to-background px-8">
      <motion.div
        initial={{ scale: 0, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 11 }}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-card text-6xl shadow-xl"
      >
        👋
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 font-display text-3xl font-extrabold"
      >
        Hi {data.childName.split(" ")[0]}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-center text-[14px] text-muted-foreground"
      >
        You're linked with {data.parentName}. Let's learn money the fun way!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-8 w-full"
      >
        <Button size="lg" className="w-full" onClick={() => go("childPin")}>
          Set my PIN <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
      <div className="mt-6">
        <Logo size="sm" />
      </div>
    </div>
  );
}

/* ---------- PIN ---------- */
export function PinPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) =>
        k === "" ? (
          <span key={i} />
        ) : k === "del" ? (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(value.slice(0, -1))}
            className="h-14 rounded-2xl bg-muted text-lg font-extrabold"
          >
            ⌫
          </motion.button>
        ) : (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange((value + k).slice(0, 4))}
            className="h-14 rounded-2xl bg-violet-soft font-display text-2xl font-extrabold text-primary"
          >
            {k}
          </motion.button>
        )
      )}
    </div>
  );
}

export function ChildPinScreen() {
  const { go, data } = useApp();
  const setPinStore = useApp((s) => s.setPin);
  const toast = useToast((s) => s.show);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const stage = confirm === null ? "set" : "confirm";

  const onSet = (v: string) => {
    setPin(v);
    if (v.length === 4) setTimeout(() => setConfirm(""), 250);
  };

  const onConfirm = (v: string) => {
    setConfirm(v);
    if (v.length === 4) {
      if (v === pin) {
        setPinStore();
        toast("PIN saved — keep it secret!", "🔐");
        setTimeout(() => go("childAvatar"), 400);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setConfirm("");
        }, 700);
      }
    }
  };

  return (
    <Screen>
      <AppHeader title="Create your PIN" subtitle={data.childName} />
      <div className="flex min-h-0 flex-1 flex-col px-8 pb-8">
        <div className="mt-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft text-2xl">
            🔐
          </div>
          <p className="mt-3 font-display text-lg font-extrabold">
            {stage === "set" ? "Choose a 4-digit PIN" : "Confirm your PIN"}
          </p>
          <div className="mt-3 flex justify-center gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-full transition-colors ${
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
            <p className="mt-2 text-[12px] font-bold text-coral">
              PINs don't match — try again
            </p>
          )}
        </div>
        <div className="mx-auto mt-auto w-full max-w-[280px]">
          <PinPad
            value={stage === "set" ? pin : confirm || ""}
            onChange={stage === "set" ? onSet : onConfirm}
          />
        </div>
      </div>
    </Screen>
  );
}

/* ---------- Avatar picker ---------- */
const AVATARS = ["🦊", "🐯", "🐼", "🦁", "🐧", "🦄", "🐸", "🐙"];

export function ChildAvatarScreen() {
  const { setChildProfile, setRole, reset, data } = useApp();
  const [picked, setPicked] = useState(data.childAvatar);
  return (
    <Screen>
      <AppHeader title="Pick your avatar" />
      <ScrollArea className="flex flex-col px-8 pb-8">
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Choose a buddy to join your money journey!
        </p>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {AVATARS.map((a) => (
            <motion.button
              key={a}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPicked(a)}
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm transition-colors ${
                picked === a ? "bg-primary" : "bg-card"
              }`}
            >
              <AnimatePresence>
                {picked === a && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mint"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.span>
                )}
              </AnimatePresence>
              {a}
            </motion.button>
          ))}
        </div>
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            setChildProfile({ childAvatar: picked });
            setRole("child");
            reset("childHome");
          }}
        >
          Start my journey 🚀
        </Button>
      </ScrollArea>
    </Screen>
  );
}
