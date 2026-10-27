import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Home,
  Activity,
  ListChecks,
  User,
  BookOpen,
  Wallet,
  Target,
  CheckCircle2,
  Clock,
  Hourglass,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inr, inrSigned, formatDay } from "@/lib/bachpanse/format";
import type { Goal, Task, Transaction } from "@/lib/bachpanse/types";
import {
  Card,
  ProgressRing,
  useCountUp,
  InfoPill,
} from "@/components/bachpanse/ui";

/* ---------- App header ---------- */
export function AppHeader({
  title,
  subtitle,
  onBack,
  right,
  center,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  onBack?: (() => void) | undefined;
  right?: ReactNode | undefined;
  center?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "flex h-[56px] shrink-0 items-center gap-2 px-4",
        center && "justify-center"
      )}
    >
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      )}
      {title && (
        <div className={cn("min-w-0 flex-1", center && "text-center")}>
          <h2 className="truncate font-display text-lg font-extrabold leading-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ---------- Bottom tab bar ---------- */
export type TabDef = { id: string; label: string; icon: ReactNode };

export const PARENT_TABS: TabDef[] = [
  { id: "parentHome", label: "Home", icon: <Home className="h-5 w-5" /> },
  { id: "parentActivity", label: "Activity", icon: <Activity className="h-5 w-5" /> },
  { id: "parentTasks", label: "Tasks", icon: <ListChecks className="h-5 w-5" /> },
  { id: "parentProfile", label: "Profile", icon: <User className="h-5 w-5" /> },
];

export const CHILD_TABS: TabDef[] = [
  { id: "childHome", label: "Home", icon: <Home className="h-5 w-5" /> },
  { id: "childLearn", label: "Learn", icon: <BookOpen className="h-5 w-5" /> },
  { id: "childMoney", label: "Money", icon: <Wallet className="h-5 w-5" /> },
  { id: "childGoals", label: "Goals", icon: <Target className="h-5 w-5" /> },
  { id: "childMe", label: "Me", icon: <User className="h-5 w-5" /> },
];

export function BottomTabBar({
  tabs,
  active,
  onTab,
}: {
  tabs: TabDef[];
  active: string;
  onTab: (id: string) => void;
}) {
  return (
    <div className="z-20 flex h-[64px] shrink-0 items-stretch border-t border-border bg-card px-2 pb-1">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5">
              {t.icon}
              <span className="text-[10px] font-bold">{t.label}</span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Balance card ---------- */
export function BalanceCard({
  balance,
  moneyIn,
  moneyOut,
  title = "My money",
}: {
  balance: number;
  moneyIn: number;
  moneyOut: number;
  title?: string;
}) {
  const animated = useCountUp(balance);
  return (
    <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/30">
      <p className="text-[12px] font-semibold opacity-80">{title}</p>
      <p className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-tight">
        {inr(animated)}
      </p>
      <div className="mt-3 flex gap-3 text-[12px] font-semibold">
        <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1">
          <ArrowDownCircle className="h-3.5 w-3.5" />
          In {inr(moneyIn)}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1">
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Out {inr(moneyOut)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Transaction row ---------- */
export const CATEGORY_EMOJI: Record<string, string> = {
  "Pocket money": "💰",
  Gift: "🎁",
  "Task reward": "✅",
  Food: "🍔",
  Stationery: "✏️",
  Games: "🎮",
  Travel: "🚌",
  Gifts: "🎁",
  Goal: "🎯",
  Other: "📦",
};

export function TransactionRow({
  t,
  onClick,
}: {
  t: Transaction;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-card px-3.5 py-3 text-left shadow-sm"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
          t.type === "in" ? "bg-mint-soft" : "bg-coral-soft"
        )}
      >
        {CATEGORY_EMOJI[t.category] ?? CATEGORY_EMOJI["Other"]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-foreground">{t.note}</p>
        <p className="truncate text-[12px] text-muted-foreground">
          {t.category} · {t.recordedBy} · {formatDay(t.date)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-[15px] font-extrabold",
          t.type === "in" ? "text-mint" : "text-coral"
        )}
      >
        {inrSigned(t.amount, t.type)}
      </span>
    </motion.button>
  );
}

/* ---------- Goal card ---------- */
export function GoalCard({
  goal,
  onClick,
  action,
}: {
  goal: Goal;
  onClick?: () => void;
  action?: ReactNode;
}) {
  const p = goal.target > 0 ? goal.saved / goal.target : 0;
  const reached = goal.saved >= goal.target;
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <ProgressRing
        progress={p}
        color={reached ? "var(--mint)" : "var(--primary)"}
      >
        <span className="text-xl">{goal.emoji}</span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-foreground">
          {goal.name}
        </p>
        <p className="text-[12px] text-muted-foreground">
          {inr(goal.saved)} of {inr(goal.target)}
        </p>
        {reached && (
          <InfoPill tone="mint">🏆 Goal reached</InfoPill>
        )}
      </div>
      {action}
    </Card>
  );
}

/* ---------- Task card ---------- */
export function TaskCard({
  task,
  onClick,
  children,
}: {
  task: Task;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const statusMap = {
    todo: { label: "To do", cls: "bg-sunny-soft text-foreground", icon: <Clock className="h-3 w-3" /> },
    waiting: { label: "Waiting for parent", cls: "bg-violet-soft text-primary", icon: <Hourglass className="h-3 w-3" /> },
    completed: { label: "Completed", cls: "bg-mint-soft text-primary", icon: <CheckCircle2 className="h-3 w-3" /> },
  } as const;
  const s = statusMap[task.status];
  return (
    <Card onClick={onClick} className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-foreground">
            {task.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
            {task.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sunny px-2.5 py-1 text-[13px] font-extrabold text-foreground">
          {inr(task.reward)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <InfoPill onClick={() => {}} tone="violet">
          {s.icon}
          {s.label}
        </InfoPill>
        <span className="text-[11px] text-muted-foreground">
          Due {formatDay(task.dueDate)}
        </span>
      </div>
      {children}
    </Card>
  );
}
