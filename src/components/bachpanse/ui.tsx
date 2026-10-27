import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Delete, PartyPopper } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useToast, useComingSoon, useFx } from "@/lib/bachpanse/store";

/* ---------- Button ---------- */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-display font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-md shadow-primary/30",
        mint: "bg-mint text-primary-foreground shadow-md shadow-mint/30",
        sunny: "bg-sunny text-foreground shadow-md shadow-sunny/40",
        coral: "bg-coral text-primary-foreground shadow-md shadow-coral/30",
        outline: "border-2 border-primary/25 bg-card text-primary",
        soft: "bg-violet-soft text-primary",
        ghost: "text-primary hover:bg-violet-soft",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-[15px]",
        lg: "h-13 px-6 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as object)}
    />
  );
}

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm",
        className
      )}
      {...(props as object)}
    />
  );
}

/* ---------- Card / section ---------- */
export function Card({
  className,
  children,
  onClick,
}: {
  className?: string | undefined;
  children: ReactNode;
  onClick?: (() => void) | undefined;
}) {
  return (
    <motion.div
      {...(onClick ? { whileTap: { scale: 0.98 }, onClick } : {})}
      className={cn(
        "rounded-2xl bg-card p-4 shadow-sm shadow-primary/5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h3 className="text-[15px] font-extrabold text-foreground">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="text-[13px] font-bold text-primary hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-violet-soft text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

export function InfoPill({
  children,
  onClick,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "violet" | "mint" | "sunny" | "coral";
  className?: string;
}) {
  const tones = {
    violet: "bg-violet-soft text-primary",
    mint: "bg-mint-soft text-primary",
    sunny: "bg-sunny-soft text-foreground",
    coral: "bg-coral-soft text-coral",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        tones[tone],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Bottom sheet ---------- */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxH = "78%",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxH?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col justify-end"
        >
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative flex max-h-full flex-col rounded-t-[28px] bg-card px-5 pb-8 pt-3"
            style={{ maxHeight: maxH }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/25" />
            {title && (
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-extrabold">{title}</h3>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-soft text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ComingSoonSheet() {
  const { open, topic, close } = useComingSoon();
  return (
    <BottomSheet open={open} onClose={close}>
      <div className="flex flex-col items-center px-4 pb-4 pt-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sunny-soft text-3xl">
          🚧
        </div>
        <h3 className="mt-3 font-display text-lg font-extrabold">
          Coming in a later phase
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {topic ||
            "This part of BachpanSe is still being built. Try it in a future version!"}
        </p>
        <Button className="mt-5 w-full" onClick={close}>
          Got it
        </Button>
      </div>
    </BottomSheet>
  );
}

/* ---------- Toasts ---------- */
export function Toasts() {
  const { toasts } = useToast();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="flex max-w-full items-center gap-2 rounded-full bg-foreground/90 px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg"
          >
            {t.emoji && <span>{t.emoji}</span>}
            <span className="truncate">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Confetti ---------- */
const CONFETTI_COLORS = [
  "var(--primary)",
  "var(--mint)",
  "var(--sunny)",
  "var(--coral)",
];

export function Confetti() {
  const { burst } = useFx();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (burst === 0) return;
    setActive(burst);
    const t = setTimeout(() => setActive(0), 1800);
    return () => clearTimeout(t);
  }, [burst]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.1 + Math.random() * 0.6,
        color: CONFETTI_COLORS[i % 4],
        size: 6 + Math.random() * 6,
        round: Math.random() > 0.5,
        drift: (Math.random() - 0.5) * 120,
      })),
    [active]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[70] overflow-hidden">
      <AnimatePresence>
        {active > 0 &&

          pieces.map((p) => (
            <motion.div
              key={`${active}-${p.id}`}
              initial={{ x: `${p.x}vw`, y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: 900,
                x: `calc(${p.x}vw + ${p.drift}px)`,
                rotate: 360 + Math.random() * 360,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
              style={{
                position: "absolute",
                left: 0,
                width: p.size,
                height: p.size * (p.round ? 1 : 0.5),
                borderRadius: p.round ? "50%" : 2,
                background: p.color,
              }}
            />
          ))}
      </AnimatePresence>
      {active > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 rounded-full bg-card px-5 py-3 shadow-xl">
            <PartyPopper className="h-5 w-5 text-sunny" />
            <span className="font-display font-extrabold text-primary">
              Well done!
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Count up ---------- */
export function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

/* ---------- Progress ring ---------- */
export function ProgressRing({
  progress,
  size = 52,
  stroke = 6,
  color = "var(--primary)",
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--violet-soft)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ---------- Keypad ---------- */
export function Keypad({
  value,
  onChange,
  maxLength = 7,
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  prefix?: string;
}) {
  const press = (k: string) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (value.length >= maxLength) return;
    if (k === "0" && value === "") return;
    onChange(value + k);
  };
  return (
    <div>
      <div className="mb-3 flex h-14 items-center justify-center rounded-2xl bg-violet-soft">
        <span className="font-display text-3xl font-extrabold text-primary">
          {prefix}
          {value || "0"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
          (k, i) =>
            k === "" ? (
              <span key={i} />
            ) : k === "del" ? (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => press(k)}
                className="flex h-12 items-center justify-center rounded-2xl bg-muted text-foreground"
              >
                <Delete className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => press(k)}
                className="h-12 rounded-2xl bg-violet-soft font-display text-xl font-extrabold text-primary"
              >
                {k}
              </motion.button>
            )
        )}
      </div>
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

/* ---------- Mock QR code ---------- */
export function MockQR({ seed, size = 150 }: { seed: string; size?: number }) {
  const n = 21;
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const ch of seed) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    const rand = () => {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h >>> 16) & 0xffff) / 0xffff;
    };
    const grid: boolean[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => rand() > 0.52)
    );
    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[r0 + r]![c0 + c] = edge || core;
        }
    };
    finder(0, 0);
    finder(0, n - 7);
    finder(n - 7, 0);
    return grid;
  }, [seed]);

  const cell = size / n;
  return (
    <div
      className="rounded-xl bg-white p-2.5 shadow-sm"
      style={{ width: size + 20, height: size + 20 }}
    >
      <svg width={size} height={size}>
        {cells.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                rx={cell * 0.25}
                fill="var(--foreground)"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

/* ---------- OTP / code boxes ---------- */
export function CodeBoxes({
  length,
  value,
  onChange,
  boxClass,
}: {
  length: number;
  value: string;
  onChange: (v: string) => void;
  boxClass?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex justify-center gap-2" onClick={() => ref.current?.focus()}>
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex h-12 w-11 items-center justify-center rounded-xl border-2 border-border bg-card font-display text-xl font-extrabold text-foreground",
            value.length === i && "border-primary",
            boxClass
          )}
        >
          {value[i] ?? ""}
        </div>
      ))}
      <input
        ref={ref}
        autoFocus
        inputMode="numeric"
        className="h-0 w-0 opacity-0"
        value={value}
        maxLength={length}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
      />
    </div>
  );
}

/* ---------- Empty state SVG ---------- */
export function EmptyArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className}>
      <ellipse cx="100" cy="105" rx="70" ry="8" fill="var(--violet-soft)" />
      <circle cx="100" cy="55" r="38" fill="var(--violet-soft)" />
      <circle cx="88" cy="50" r="5" fill="var(--foreground)" opacity="0.6" />
      <circle cx="112" cy="50" r="5" fill="var(--foreground)" opacity="0.6" />
      <path
        d="M88 66 Q100 76 112 66"
        stroke="var(--foreground)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="100" cy="98" r="6" fill="var(--sunny)" />
      <circle cx="130" cy="30" r="4" fill="var(--mint)" />
      <circle cx="66" cy="34" r="3" fill="var(--coral)" />
    </svg>
  );
}
