import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";
import logoAsset from "@/assets/bachpanse-logo.png.asset.json";
import { useApp } from "@/lib/bachpanse/store";
import { Button } from "@/components/bachpanse/ui";

/* ---------- shared hooks / fields ---------- */
export function useSkeleton(ms = 400) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-bold text-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[13px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border-2 border-border bg-card px-3.5 py-2.5 text-[14px] font-semibold text-foreground outline-none focus:border-primary placeholder:font-normal placeholder:text-muted-foreground";

/* ---------- Screen scaffold ---------- */
export function Screen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function ScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto ${className ?? ""}`}>
      {children}
    </div>
  );
}

/* ---------- Logo ---------- */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = { sm: "h-7", md: "h-10", lg: "h-16" }[size];
  return (
    <img
      src={logoAsset.url}
      alt="BachpanSe — Money Wise!"
      className={`${h} w-auto`}
    />
  );
}

/* ---------- Splash ---------- */
export function SplashScreen() {
  const go = useApp((s) => s.go);
  const reset = useApp((s) => s.reset);
  const role = useApp((s) => s.role);
  const signedIn = useApp((s) => s.session.signedIn);
  useEffect(() => {
    const t = setTimeout(() => {
      if (signedIn && role !== "none") {
        reset(role === "parent" ? "parentHome" : "childHome");
      } else {
        go("welcome");
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [go, reset, role, signedIn]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-violet-soft to-background">
      <motion.img
        src={logoAsset.url}
        alt="BachpanSe — Money Wise!"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="h-40 w-auto drop-shadow-xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-2"
      >
        <p className="text-[13px] font-semibold text-muted-foreground">
          Learn money the fun way
        </p>
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="mt-8 text-2xl"
      >
        🪙
      </motion.div>
    </div>
  );
}

/* ---------- Welcome carousel ---------- */
const SLIDES = [
  {
    emoji: "🎓",
    title: "Learn money the fun way",
    text: "Short story lessons and quizzes that make money simple — from saving to spotting scams.",
    bg: "bg-violet-soft",
  },
  {
    emoji: "🧾",
    title: "Track what you get and spend",
    text: "Pocket money, gifts and spending in one place. See where every rupee goes.",
    bg: "bg-mint-soft",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Parents stay in the loop",
    text: "Parents can see progress, send tasks with rewards and cheer every goal.",
    bg: "bg-sunny-soft",
  },
];

export function WelcomeScreen() {
  const { go } = useApp();
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex justify-end px-5 pt-2">
        <button
          onClick={() => go("loginPhone")}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold text-muted-foreground"
        >
          Skip <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className={`flex h-40 w-40 items-center justify-center rounded-[40px] ${slide.bg} text-7xl shadow-lg`}
            >
              {slide.emoji}
            </div>
            <h2 className="mt-8 font-display text-2xl font-extrabold text-foreground">
              {slide.title}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              {slide.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-2 pb-3">
        {SLIDES.map((_, d) => (
          <div
            key={d}
            className={`h-2 rounded-full transition-all ${
              d === i ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <div className="px-8 pb-10">
        <Button
          size="lg"
          className="w-full"
          onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : go("loginPhone"))}
        >
          {i < SLIDES.length - 1 ? "Next" : "Get started"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

