import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppData, Goal, Task, Transaction } from "./types";
import { seedData } from "./mock-data";
import { seedContent, type Challenge, type LmsLesson, type LmsModule, type Quiz, type ContentStatus } from "./content";
import { todayISO } from "./format";
import { BADGES } from "./lessons";

export type ScreenId =
  | "splash"
  | "welcome"
  | "roleSelect"
  | "loginPhone"
  | "loginOtp"
  | "parentName"
  | "parentConsent"
  | "addChild"
  | "parentInvite"
  | "parentHome"
  | "parentActivity"
  | "parentTasks"
  | "parentProfile"
  | "childCode"
  | "childScan"
  | "childWelcome"
  | "childPin"
  | "childAvatar"
  | "childHome"
  | "childLearn"
  | "childMoney"
  | "childGoals"
  | "childMe"
  | "moduleDetail"
  | "lessonPlayer"
  | "quiz"
  | "badges"
  | "practiceHome"
  | "practiceShop"
  | "practiceSave"
  | "childTasks"
  | "childPrivacy"
  | "changePin"
  | "help";

export type ParentTab = "parentHome" | "parentActivity" | "parentTasks" | "parentProfile";
export type ChildTab = "childHome" | "childLearn" | "childMoney" | "childGoals" | "childMe";

export interface ScreenEntry {
  screen: ScreenId;
  params?: Record<string, unknown> | undefined;
}

export interface Account {
  phone: string;
  role: "parent" | "child";
}

/** Demo accounts seeded so "Log in" works out of the box: one parent and one child number. */
export const DEMO_ACCOUNTS: Account[] = [
  { phone: "9876543210", role: "parent" },
  { phone: "9876543211", role: "child" },
];

export function findDemoAccount(phone: string): Account | undefined {
  return DEMO_ACCOUNTS.find((a) => a.phone === phone);
}

interface AppState {
  role: "none" | "parent" | "child";
  session: { signedIn: boolean; phone: string };
  account: Account | null;
  authMode: "login" | "signup";
  stack: ScreenEntry[];
  direction: 1 | -1;
  data: AppData;
  // navigation
  go: (screen: ScreenId, params?: Record<string, unknown>) => void;
  back: () => void;
  reset: (screen: ScreenId) => void;
  setRole: (role: "none" | "parent" | "child") => void;
  setAuthMode: (mode: "login" | "signup") => void;
  signInStart: (phone: string) => void;
  signInComplete: (role: "parent" | "child") => void;
  logout: () => void;
  // data actions
  setParentProfile: (name: string, phone: string) => void;
  setConsent: () => void;
  withdrawConsent: () => void;
  setChildProfile: (patch: Partial<Pick<AppData, "childName" | "childDob" | "childPhone" | "childAvatar">>) => void;
  setPin: () => void;
  addMoneyIn: (t: { amount: number; category: string; note: string; date: string }) => void;
  addSpending: (t: { amount: number; category: string; note: string; date: string }) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  createTask: (t: { title: string; description: string; reward: number; dueDate: string }) => void;
  childMarkDone: (id: string) => void;
  approveTask: (id: string) => void;
  rejectTask: (id: string) => void;
  createGoal: (g: { name: string; emoji: string; target: number; targetDate?: string }) => void;
  addToGoal: (id: string, amount: number) => boolean;
  completeLesson: (moduleId: number, quizScore: number) => void;
  claimDaily: () => void;
  savePractice: (challenge: "shop" | "save", score: number, max: number) => void;
  // LMS content actions (shared with the child app)
  addModule: (m: LmsModule) => void;
  updateModule: (id: number, patch: Partial<LmsModule>) => void;
  reorderModule: (id: number, dir: 1 | -1) => void;
  addLesson: (lesson: LmsLesson) => void;
  updateLesson: (id: string, patch: Partial<LmsLesson>) => void;
  setLessonStatus: (id: string, status: ContentStatus) => void;
  deleteLesson: (id: string) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, patch: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  updateChallenge: (id: string, patch: Partial<Challenge>) => void;
  setChallengeStatus: (id: string, status: ContentStatus) => void;
  resetDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

function unlockBadge(d: AppData, id: string): boolean {
  if (d.unlockedBadges.includes(id)) return false;
  d.unlockedBadges.push(id);
  return true;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      role: "none",
      session: { signedIn: false, phone: "" },
      account: DEMO_ACCOUNTS[0]!,
      authMode: "login",
      stack: [{ screen: "splash" }],
      direction: 1,
      data: seedData(),

      go: (screen, params) =>
        set((s) => ({
          stack: [...s.stack, { screen, params }],
          direction: 1,
        })),
      back: () =>
        set((s) => {
          if (s.stack.length <= 1) return s;
          return { stack: s.stack.slice(0, -1), direction: -1 };
        }),
      reset: (screen) => set({ stack: [{ screen }], direction: 1 }),
      setRole: (role) => set({ role }),
      setAuthMode: (authMode) => set({ authMode }),
      signInStart: (phone) => set({ session: { signedIn: false, phone } }),
      signInComplete: (role) =>
        set((s) => {
          // Demo numbers always load the fresh demo family (Aditya / Divya),
          // so leftover edits from earlier sessions never leak into a demo login.
          const isDemo = findDemoAccount(s.session.phone) !== undefined;
          return {
            role,
            session: { signedIn: true, phone: s.session.phone },
            account: { phone: s.session.phone, role },
            ...(isDemo ? { data: seedData() } : {}),
          };
        }),
      logout: () =>
        set({
          role: "none",
          session: { signedIn: false, phone: "" },
          authMode: "login",
          stack: [{ screen: "loginPhone" }],
          direction: 1,
        }),

      setParentProfile: (name, phone) =>
        set((s) => ({ data: { ...s.data, parentName: name, parentPhone: phone } })),
      setConsent: () =>
        set((s) => ({
          data: { ...s.data, consentGivenAt: todayISO(), consentWithdrawn: false },
        })),
      withdrawConsent: () =>
        set((s) => ({ data: { ...s.data, consentWithdrawn: true } })),
      setChildProfile: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),
      setPin: () => set((s) => ({ data: { ...s.data, pinSet: true } })),

      addMoneyIn: (t) =>
        set((s) => ({
          data: {
            ...s.data,
            transactions: [
              { id: uid(), type: "in", recordedBy: "Parent", ...t },
              ...s.data.transactions,
            ],
          },
        })),
      addSpending: (t) =>
        set((s) => ({
          data: {
            ...s.data,
            transactions: [
              { id: uid(), type: "out", recordedBy: "Child", ...t },
              ...s.data.transactions,
            ],
          },
        })),
      updateTransaction: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            transactions: s.data.transactions.map((t) =>
              t.id === id ? { ...t, ...patch } : t
            ),
          },
        })),
      deleteTransaction: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            transactions: s.data.transactions.filter((t) => t.id !== id),
          },
        })),

      createTask: (t) =>
        set((s) => ({
          data: {
            ...s.data,
            tasks: [{ id: uid(), status: "todo" as const, ...t }, ...s.data.tasks],
          },
        })),
      childMarkDone: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            tasks: s.data.tasks.map((t) =>
              t.id === id ? { ...t, status: "waiting" as const } : t
            ),
          },
        })),
      approveTask: (id) => {
        const task = get().data.tasks.find((t) => t.id === id);
        if (!task) return;
        set((s) => ({
          data: {
            ...s.data,
            tasks: s.data.tasks.map((t) =>
              t.id === id
                ? { ...t, status: "completed" as const, completedAt: todayISO() }
                : t
            ),
            transactions: [
              {
                id: uid(),
                type: "in" as const,
                category: "Task reward",
                note: task.title,
                amount: task.reward,
                date: todayISO(),
                recordedBy: "Parent" as const,
              },
              ...s.data.transactions,
            ],
          },
        }));
      },
      rejectTask: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            tasks: s.data.tasks.map((t) =>
              t.id === id ? { ...t, status: "todo" as const } : t
            ),
          },
        })),

      createGoal: (g) =>
        set((s) => ({
          data: {
            ...s.data,
            goals: [
              { id: uid(), saved: 0, reached: false, ...g },
              ...s.data.goals,
            ],
          },
        })),
      addToGoal: (id, amount) => {
        const goal = get().data.goals.find((g) => g.id === id);
        if (!goal) return false;
        const saved = goal.saved + amount;
        const reached = saved >= goal.target;
        set((s) => ({
          data: {
            ...s.data,
            goals: s.data.goals.map((g): Goal =>
              g.id === id ? { ...g, saved, reached } : g
            ),
            transactions: [
              {
                id: uid(),
                type: "out" as const,
                category: "Goal",
                note: goal.name,
                amount,
                date: todayISO(),
                recordedBy: "Child" as const,
              },
              ...s.data.transactions,
            ],
          },
        }));
        if (reached) {
          set((s) => {
            const d = { ...s.data, unlockedBadges: [...s.data.unlockedBadges] };
            unlockBadge(d, "goal-reached");
            return { data: d };
          });
        }
        return reached;
      },

      completeLesson: (moduleId, quizScore) => {
        set((s) => {
          const pubCount = modulePublishedCount(s.data, moduleId);
          const d: AppData = {
            ...s.data,
            modules: s.data.modules.map((m) =>
              m.id === moduleId
                ? { ...m, lessonsDone: Math.min(pubCount, m.lessonsDone + 1) }
                : m
            ),
            points: s.data.points + 50 + quizScore * 10,
            unlockedBadges: [...s.data.unlockedBadges],
          };
          unlockBadge(d, "first-lesson");
          if (quizScore === 3) unlockBadge(d, "quiz-ace");
          const modDone = (m: LmsModule) =>
            (d.modules.find((p) => p.id === m.id)?.lessonsDone ?? 0) >=
            modulePublishedCount(d, m.id);
          const mod = d.content.modules.find((m) => m.id === moduleId);
          if (mod && modDone(mod) && moduleId === 1) unlockBadge(d, "module-1");
          if (mod && modDone(mod) && moduleId === 6) unlockBadge(d, "module-all");
          if (d.content.modules.every((m) => m.status === "draft" || modDone(m)))
            unlockBadge(d, "module-all");
          return { data: d };
        });
      },
      claimDaily: () =>
        set((s) => ({
          data: { ...s.data, points: s.data.points + 20, lastDailyClaim: todayISO() },
        })),
      savePractice: (challenge, score, max) =>
        set((s) => {
          const d: AppData = {
            ...s.data,
            practiceHistory: [
              { id: uid(), challenge, score, max, date: todayISO() },
              ...s.data.practiceHistory,
            ].slice(0, 12),
            unlockedBadges: [...s.data.unlockedBadges],
            points: s.data.points + score * 5,
          };
          if (challenge === "shop" && score >= 8) unlockBadge(d, "practice-pro");
          return { data: d };
        }),

      // ---------- LMS content actions ----------
      addModule: (m) =>
        set((s) => ({
          data: {
            ...s.data,
            content: { ...s.data.content, modules: [...s.data.content.modules, m] },
          },
        })),
      updateModule: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              modules: s.data.content.modules.map((m) =>
                m.id === id ? { ...m, ...patch } : m
              ),
            },
          },
        })),
      reorderModule: (id, dir) =>
        set((s) => {
          const sorted = [...s.data.content.modules].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((m) => m.id === id);
          const swapIdx = idx + dir;
          if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return s;
          const a = sorted[idx]!;
          const b = sorted[swapIdx]!;
          const modules = s.data.content.modules.map((m) =>
            m.id === a.id ? { ...m, order: b.order } : m.id === b.id ? { ...m, order: a.order } : m
          );
          return {
            data: { ...s.data, content: { ...s.data.content, modules } },
          };
        }),
      addLesson: (lesson) =>
        set((s) => ({
          data: {
            ...s.data,
            content: { ...s.data.content, lessons: [...s.data.content.lessons, lesson] },
          },
        })),
      updateLesson: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              lessons: s.data.content.lessons.map((l) =>
                l.id === id ? { ...l, ...patch, updatedAt: todayISO() } : l
              ),
            },
          },
        })),
      setLessonStatus: (id, status) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              lessons: s.data.content.lessons.map((l) =>
                l.id === id ? { ...l, status, updatedAt: todayISO() } : l
              ),
            },
          },
        })),
      deleteLesson: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              lessons: s.data.content.lessons.filter((l) => l.id !== id),
              quizzes: s.data.content.quizzes.filter((q) => q.lessonId !== id),
            },
          },
        })),
      addQuiz: (quiz) =>
        set((s) => ({
          data: {
            ...s.data,
            content: { ...s.data.content, quizzes: [...s.data.content.quizzes, quiz] },
          },
        })),
      updateQuiz: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              quizzes: s.data.content.quizzes.map((q) =>
                q.id === id ? { ...q, ...patch } : q
              ),
            },
          },
        })),
      deleteQuiz: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              quizzes: s.data.content.quizzes.filter((q) => q.id !== id),
            },
          },
        })),
      updateChallenge: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              challenges: s.data.content.challenges.map((c) =>
                c.id === id ? { ...c, ...patch } : c
              ),
            },
          },
        })),
      setChallengeStatus: (id, status) =>
        set((s) => ({
          data: {
            ...s.data,
            content: {
              ...s.data.content,
              challenges: s.data.content.challenges.map((c) =>
                c.id === id ? { ...c, status } : c
              ),
            },
          },
        })),
      resetDemo: () => set((s) => ({ data: seedData(), role: s.role })),
    }),
    {
      name: "bachpanse-demo-v1",
      version: 4,
      // v4 adds shared LMS content (modules/lessons/quizzes/challenges) inside AppData.
      // Existing saved state is kept; content is injected where missing.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<{
          data: Partial<AppData>;
          role: "none" | "parent" | "child";
          session: { signedIn: boolean; phone: string };
          account: Account | null;
        }>;
        const base = seedData();
        const data: AppData = p.data
          ? { ...base, ...p.data, content: p.data.content ?? seedContent() }
          : base;
        return {
          data,
          role: p.role ?? ("none" as const),
          session: p.session ?? { signedIn: false, phone: "" },
          account: p.account ?? DEMO_ACCOUNTS[0]!,
        };
      },
      partialize: (s) => ({ data: s.data, role: s.role, session: s.session, account: s.account }),
    }
  )
);

// ---------- derived selectors ----------
export const selectBalance = (d: AppData) =>
  d.transactions.reduce((sum, t) => sum + (t.type === "in" ? t.amount : -t.amount), 0);

export function monthTotals(d: AppData, now = new Date()) {
  let moneyIn = 0;
  let moneyOut = 0;
  for (const t of d.transactions) {
    const dt = new Date(t.date);
    if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) {
      if (t.type === "in") moneyIn += t.amount;
      else moneyOut += t.amount;
    }
  }
  return { moneyIn, moneyOut };
}

export function outByCategory(d: AppData) {
  const map = new Map<string, number>();
  for (const t of d.transactions) {
    if (t.type === "out") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

/* ---------- content selectors (published-only for the child app) ---------- */

export function publishedModules(d: AppData): LmsModule[] {
  return d.content.modules
    .filter((m) => m.status === "published")
    .sort((a, b) => a.order - b.order);
}

export function publishedLessons(d: AppData, moduleId: number): LmsLesson[] {
  return d.content.lessons
    .filter((l) => l.moduleId === moduleId && l.status === "published")
    .sort((a, b) => a.order - b.order);
}

export function modulePublishedCount(d: AppData, moduleId: number): number {
  return publishedLessons(d, moduleId).length;
}

export function moduleProgress(d: AppData, moduleId: number) {
  return d.modules.find((m) => m.id === moduleId) ?? { id: moduleId, lessonsDone: 0 };
}

/** `idx` is the index within the published module list. */
export function moduleUnlocked(d: AppData, idx: number): boolean {
  const mods = publishedModules(d);
  if (idx <= 0) return true;
  const prev = mods[idx - 1];
  if (!prev) return false;
  return moduleProgress(d, prev.id).lessonsDone >= modulePublishedCount(d, prev.id);
}

export function getLesson(d: AppData, id: string): LmsLesson | undefined {
  return d.content.lessons.find((l) => l.id === id);
}

export function getLessonQuiz(d: AppData, lessonId: string): Quiz | undefined {
  return d.content.quizzes.find((q) => q.lessonId === lessonId);
}

export function getShopChallenge(d: AppData): Challenge | undefined {
  return d.content.challenges.find((c) => c.type === "shop" && c.status === "published");
}

export function getSaveChallenge(d: AppData): Challenge | undefined {
  return d.content.challenges.find((c) => c.type === "save" && c.status === "published");
}

export function goalTotalSaved(d: AppData) {
  return d.goals.reduce((a, g) => a + g.saved, 0);
}

export function badgeById(id: string) {
  return BADGES.find((b) => b.id === id);
}

// ---------- ephemeral UI stores (not persisted) ----------
interface ToastState {
  toasts: { id: number; message: string; emoji?: string }[];
  show: (message: string, emoji?: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message, emoji) => {
    const id = Date.now() + Math.random();
    set((s) => ({
      toasts: [...s.toasts, emoji !== undefined ? { id, message, emoji } : { id, message }],
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
}));

interface ComingSoonState {
  open: boolean;
  topic: string;
  openSheet: (topic: string) => void;
  close: () => void;
}

export const useComingSoon = create<ComingSoonState>((set) => ({
  open: false,
  topic: "",
  openSheet: (topic) => set({ open: true, topic }),
  close: () => set({ open: false }),
}));

interface FxState {
  burst: number;
  fire: () => void;
}

export const useFx = create<FxState>((set) => ({
  burst: 0,
  fire: () => set((s) => ({ burst: s.burst + 1 })),
}));
