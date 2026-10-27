import { MODULES } from "./lessons";
import { todayISO } from "./format";

/* ---------- Content types shared by the LMS and the child app ---------- */

export type ContentStatus = "published" | "draft";
export type AgeBand = "10–12" | "13–15" | "16–17";

export const AGE_BANDS: AgeBand[] = ["10–12", "13–15", "16–17"];

export type CardArt =
  | "coin"
  | "piggy"
  | "scale"
  | "target"
  | "shield"
  | "wallet"
  | "cart"
  | "bank";

export const CARD_ARTS: { id: CardArt; label: string }[] = [
  { id: "coin", label: "Coin" },
  { id: "piggy", label: "Piggy bank" },
  { id: "scale", label: "Balance scale" },
  { id: "target", label: "Target" },
  { id: "shield", label: "Safety shield" },
  { id: "wallet", label: "Wallet" },
  { id: "cart", label: "Shopping cart" },
  { id: "bank", label: "Bank building" },
];

export interface StoryCardData {
  emoji?: string;
  title: string;
  text: string;
  art: CardArt;
}

export interface QuizQuestionData {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface LmsModule {
  id: number;
  order: number;
  title: string;
  emoji: string;
  blurb: string;
  description: string;
  ageBand: AgeBand;
  status: ContentStatus;
}

export interface LmsLesson {
  id: string;
  moduleId: number;
  order: number;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  contentType: "story" | "video";
  cards: StoryCardData[];
  videoName: string;
  videoDuration: string;
  status: ContentStatus;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  passMark: number;
  questions: QuizQuestionData[];
  status: ContentStatus;
}

export interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  price: number;
  need: boolean;
}

export interface ScenarioOption {
  text: string;
  good: boolean;
  outcome: string;
}

export interface Scenario {
  emoji: string;
  q: string;
  options: ScenarioOption[];
}

export interface Challenge {
  id: string;
  type: "shop" | "save";
  name: string;
  moduleId: number;
  budget: number;
  items: ShopItem[];
  scenarios: Scenario[];
  scoringMessage: string;
  status: ContentStatus;
}

export interface ContentData {
  modules: LmsModule[];
  lessons: LmsLesson[];
  quizzes: Quiz[];
  challenges: Challenge[];
}

/* ---------- Seed content (derived from the original mobile mock content) ---------- */

const MODULE_AGE_BANDS: Record<number, AgeBand> = {
  1: "10–12",
  2: "10–12",
  3: "13–15",
  4: "13–15",
  5: "16–17",
  6: "16–17",
};

const SEED_SHOP_ITEMS: ShopItem[] = [
  { id: "s1", emoji: "📒", name: "Notebooks", price: 60, need: true },
  { id: "s2", emoji: "🚌", name: "Bus pass", price: 100, need: true },
  { id: "s3", emoji: "🍱", name: "Lunch", price: 80, need: true },
  { id: "s4", emoji: "🧴", name: "Water bottle", price: 60, need: true },
  { id: "s5", emoji: "🎨", name: "Poster paints", price: 70, need: false },
  { id: "s6", emoji: "🕹️", name: "Game skin", price: 90, need: false },
  { id: "s7", emoji: "🏀", name: "Mini hoop", price: 120, need: false },
  { id: "s8", emoji: "🍭", name: "Candy pack", price: 40, need: false },
];

const SEED_SCENARIOS: Scenario[] = [
  {
    emoji: "🎡",
    q: "You got ₹500 for your birthday. The school trip (₹400) is next month and you also want a new game.",
    options: [
      { text: "Save ₹400 for the trip first", good: true, outcome: "Smart! The trip is a need — and maybe the game later." },
      { text: "Buy the game now", good: false, outcome: "The game is fun, but you'd miss the school trip." },
      { text: "Spend it all on snacks", good: false, outcome: "Gone in a day — nothing for the trip!" },
    ],
  },
  {
    emoji: "🧢",
    q: "Your friend has expensive shoes and you feel left out. You have ₹800 saved.",
    options: [
      { text: "Wait a week and see if you still want them", good: true, outcome: "The waiting trick! Often the feeling fades." },
      { text: "Spend all ₹800 to fit in", good: false, outcome: "Buying to impress costs your own plan." },
      { text: "Ask for a loan from a classmate", good: false, outcome: "Owing money at school is a bad start!" },
    ],
  },
  {
    emoji: "🐷",
    q: "You save ₹50 every week. What helps your cricket-bat goal (₹2,500) most?",
    options: [
      { text: "Keep saving weekly and track progress", good: true, outcome: "Small steady savings win the race!" },
      { text: "Stop saving, it's too slow", good: false, outcome: "Slow is still progress — quitting isn't!" },
      { text: "Spend savings on in-game coins", good: false, outcome: "That resets your real goal to zero." },
    ],
  },
];

export function seedContent(): ContentData {
  const modules: LmsModule[] = MODULES.map((m, i) => ({
    id: m.id,
    order: i + 1,
    title: m.title,
    emoji: m.emoji,
    blurb: m.blurb,
    description: m.blurb,
    ageBand: MODULE_AGE_BANDS[m.id] ?? "10–12",
    status: "published",
  }));

  const lessons: LmsLesson[] = [];
  const quizzes: Quiz[] = [];
  const today = todayISO();

  for (const m of MODULES) {
    m.lessons.forEach((l, i) => {
      // Module 6: two lessons published, one draft — "Never share your OTP".
      const isDraft = m.id === 6 && i === 0;
      lessons.push({
        id: l.id,
        moduleId: m.id,
        order: i + 1,
        title: isDraft ? "Never share your OTP" : l.title,
        emoji: l.emoji,
        description: l.cards[0]?.text.slice(0, 90) ?? "",
        minutes: 4 + (i % 3),
        contentType: "story",
        cards: l.cards.map((c) => ({ ...c })),
        videoName: "",
        videoDuration: "",
        status: isDraft ? "draft" : "published",
        updatedAt: today,
      });
      quizzes.push({
        id: `quiz-${l.id}`,
        lessonId: l.id,
        passMark: 2,
        questions: l.quiz.map((q) => ({
          q: q.q,
          options: [...q.options],
          answer: q.answer,
          explain: q.explain,
        })),
        status: isDraft ? "draft" : "published",
      });
    });
  }

  const challenges: Challenge[] = [
    {
      id: "ch-shop",
      type: "shop",
      name: "Shop smart",
      moduleId: 5,
      budget: 500,
      items: SEED_SHOP_ITEMS.map((i) => ({ ...i })),
      scenarios: [],
      scoringMessage: "Needs come first! Cover every need, then plan a little for wants.",
      status: "published",
    },
    {
      id: "ch-save",
      type: "save",
      name: "Save or spend",
      moduleId: 3,
      budget: 0,
      items: [],
      scenarios: SEED_SCENARIOS.map((s) => ({
        emoji: s.emoji,
        q: s.q,
        options: s.options.map((o) => ({ ...o })),
      })),
      scoringMessage: "Every choice teaches you something about money.",
      status: "published",
    },
  ];

  return { modules, lessons, quizzes, challenges };
}
