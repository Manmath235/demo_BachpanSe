import type { AppData } from "./types";
import { seedContent } from "./content";
import { daysAgoISO, firstOfMonthISO, todayISO } from "./format";

export function seedData(): AppData {
  return {
    parentName: "Aditya Sharma",
    parentPhone: "98765 43210",
    childName: "Divya Sharma",
    childDob: "2013-05-14",
    childPhone: "98765 43211",
    childAvatar: "🦊",
    inviteCode: "492761",
    consentGivenAt: daysAgoISO(30),
    consentWithdrawn: false,
    transactions: [
      { id: "t1", type: "in", category: "Pocket money", note: "Monthly pocket money", amount: 1000, date: firstOfMonthISO(), recordedBy: "Parent" },
      { id: "t2", type: "in", category: "Gift", note: "Birthday gift from Nani", amount: 500, date: daysAgoISO(18), recordedBy: "Parent" },
      { id: "t3", type: "in", category: "Task reward", note: "Help with groceries", amount: 100, date: daysAgoISO(7), recordedBy: "Parent" },
      { id: "t4", type: "out", category: "Food", note: "Samosa and juice", amount: 60, date: daysAgoISO(3), recordedBy: "Child" },
      { id: "t5", type: "out", category: "Stationery", note: "Notebooks", amount: 120, date: daysAgoISO(9), recordedBy: "Child" },
      { id: "t6", type: "out", category: "Games", note: "Game top-up", amount: 199, date: daysAgoISO(5), recordedBy: "Child" },
      { id: "t7", type: "out", category: "Travel", note: "Bus fare", amount: 40, date: daysAgoISO(1), recordedBy: "Child" },
    ],
    goals: [
      { id: "g1", name: "New cricket bat", emoji: "🏏", target: 2500, saved: 900, targetDate: daysAgoISO(-60) },
      { id: "g2", name: "Gift for Mom", emoji: "🎁", target: 600, saved: 450, targetDate: daysAgoISO(-25) },
    ],
    tasks: [
      { id: "k1", title: "Water the plants for a week", description: "Water all the balcony plants every morning.", reward: 100, dueDate: daysAgoISO(-7), status: "todo" },
      { id: "k2", title: "Clean your study desk", description: "Organise books, papers and the drawer.", reward: 50, dueDate: daysAgoISO(-2), status: "waiting" },
      { id: "k3", title: "Help with groceries", description: "Carry bags and help unpack.", reward: 100, dueDate: daysAgoISO(7), status: "completed", completedAt: daysAgoISO(7) },
    ],
    modules: [
      { id: 1, lessonsDone: 3 },
      { id: 2, lessonsDone: 1 },
      { id: 3, lessonsDone: 0 },
      { id: 4, lessonsDone: 0 },
      { id: 5, lessonsDone: 0 },
      { id: 6, lessonsDone: 0 },
    ],
    streak: 5,
    points: 340,
    unlockedBadges: ["first-lesson", "module-1", "streak-5"],
    practiceCoins: 1000,
    practiceHistory: [
      { id: "p1", challenge: "shop", score: 8, max: 10, date: daysAgoISO(4) },
    ],
    lastDailyClaim: null,
    content: seedContent(),
    pinSet: true,
  };
}

export const NEW_USER_DATA: AppData = {
  ...seedData(),
  consentGivenAt: null,
  pinSet: false,
};

export { todayISO };
