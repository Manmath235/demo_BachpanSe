import type { ContentData } from "./content";

export type Role = "parent" | "child";
export type TxType = "in" | "out";
export type RecordedBy = "Parent" | "Child";

export interface Transaction {
  id: string;
  type: TxType;
  category: string;
  note: string;
  amount: number;
  date: string; // ISO
  recordedBy: RecordedBy;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  targetDate?: string;
  reached?: boolean;
}

export type TaskStatus = "todo" | "waiting" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  dueDate: string;
  status: TaskStatus;
  completedAt?: string;
}

export interface ModuleProgress {
  id: number; // 1-6
  lessonsDone: number; // 0-3
}

export interface PracticeResult {
  id: string;
  challenge: "shop" | "save";
  score: number;
  max: number;
  date: string;
}

export interface AppData {
  parentName: string;
  parentPhone: string;
  childName: string;
  childDob: string;
  childPhone: string;
  childAvatar: string;
  inviteCode: string;
  consentGivenAt: string | null;
  consentWithdrawn: boolean;
  transactions: Transaction[];
  goals: Goal[];
  tasks: Task[];
  modules: ModuleProgress[];
  streak: number;
  points: number;
  unlockedBadges: string[];
  practiceCoins: number;
  practiceHistory: PracticeResult[];
  lastDailyClaim: string | null;
  content: ContentData;
  pinSet: boolean;
}

export function childAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
