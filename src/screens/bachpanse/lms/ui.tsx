import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUp, ArrowDown, X, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useToast, useComingSoon } from "@/lib/bachpanse/store";
import type { ContentStatus } from "@/lib/bachpanse/content";

/* ---------- Skeleton ---------- */
export function useListSkeleton(ms = 300) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

export function SkeletonRows({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skeleton-shimmer h-8 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Buttons ---------- */
const lmsButtonVariants = cva(
  "inline-flex select-none items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-primary/30 bg-card text-primary hover:bg-violet-soft",
        ghost: "text-primary hover:bg-violet-soft",
        danger: "border border-coral/40 bg-card text-coral hover:bg-coral-soft",
        sunny: "bg-sunny text-foreground hover:bg-sunny/90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface LmsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof lmsButtonVariants> {}

export function LmsButton({ className, variant, size, ...props }: LmsButtonProps) {
  return (
    <button className={cn(lmsButtonVariants({ variant, size }), className)} {...props} />
  );
}

export function ReorderButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  const cls =
    "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-violet-soft hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex flex-col gap-0.5">
      <button className={cls} onClick={onUp} disabled={disableUp} aria-label="Move up">
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button className={cls} onClick={onDown} disabled={disableDown} aria-label="Move down">
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------- Status pill ---------- */
export function StatusPill({ status }: { status: ContentStatus }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        published ? "bg-mint-soft text-primary" : "bg-sunny-soft text-foreground"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-mint" : "bg-sunny")} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

/* ---------- Inputs ---------- */
export const lmsInputCls =
  "h-9 w-full rounded-lg border border-border bg-white px-3 text-[13px] font-semibold text-foreground outline-none transition-colors focus:border-primary";

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
      <span className="mb-1 block text-[12px] font-bold text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(lmsInputCls, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(lmsInputCls, "h-auto min-h-[72px] py-2 leading-relaxed", props.className)}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(lmsInputCls, "appearance-none pr-8")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/* ---------- Table ---------- */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 border-b border-border bg-violet-soft/60 px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-primary/80",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-border/60 px-3.5 py-2.5 align-middle", className)}>
      {children}
    </td>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-violet-soft/30">{children}</tr>;
}

/* ---------- Page header ---------- */
export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <div className="min-w-0">
        <h2 className="truncate font-display text-xl font-extrabold text-foreground">{title}</h2>
        {subtitle && <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Side drawer ---------- */
export function SideDrawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-foreground/30"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="absolute inset-y-0 right-0 z-50 flex w-[380px] flex-col border-l border-border bg-white shadow-2xl"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
              <h3 className="font-display text-[15px] font-extrabold">{title}</h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-violet-soft hover:text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-3">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Centered dialog (confirm / coming soon) ---------- */
export function CenterDialog({
  open,
  title,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex w-[400px] flex-col rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h3 className="font-display text-[16px] font-extrabold">{title}</h3>
            <div className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{children}</div>
            <div className="mt-5 flex justify-end gap-2">{actions}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LmsComingSoon() {
  const { open, topic, close } = useComingSoon();
  return (
    <CenterDialog open={open} title="Coming in a later phase" actions={
      <LmsButton onClick={close}>Got it</LmsButton>
    }>
      <XCircle className="mb-2 h-8 w-8 text-sunny" />
      <p>{topic || "This part of the admin panel is still being built."}</p>
    </CenterDialog>
  );
}

/* ---------- Toasts (inside the browser frame) ---------- */
export function LmsToasts() {
  const { toasts } = useToast();
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex max-w-[420px] items-center gap-2 rounded-xl bg-foreground/90 px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg"
          >
            {t.emoji && <span>{t.emoji}</span>}
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
