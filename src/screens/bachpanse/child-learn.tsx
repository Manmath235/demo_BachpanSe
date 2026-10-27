import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, X, Play, CheckCircle2, XCircle, Trophy } from "lucide-react";
import {
  useApp,
  moduleUnlocked,
  moduleProgress,
  publishedModules,
  publishedLessons,
  getLessonQuiz,
  useFx,
  useComingSoon,
} from "@/lib/bachpanse/store";
import { BADGES } from "@/lib/bachpanse/lessons";
import type { CardArt, StoryCardData } from "@/lib/bachpanse/content";
import { Button, ProgressRing, InfoPill } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";
import { Gamepad2 } from "lucide-react";

/* ---------- SVG art for story cards ---------- */
export function LessonArt({ art }: { art: CardArt }) {
  const s = { width: 120, height: 90 };
  switch (art) {
    case "coin":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <circle cx="60" cy="45" r="34" fill="var(--sunny)" />
          <circle cx="60" cy="45" r="26" fill="none" stroke="var(--foreground)" strokeOpacity="0.25" strokeWidth="3" />
          <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--foreground)">₹</text>
        </svg>
      );
    case "piggy":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <ellipse cx="60" cy="52" rx="36" ry="26" fill="var(--coral)" />
          <circle cx="88" cy="42" r="12" fill="var(--coral)" />
          <circle cx="92" cy="40" r="2.5" fill="var(--foreground)" />
          <rect x="52" y="20" width="5" height="12" rx="2" fill="var(--foreground)" opacity="0.4" />
          <circle cx="60" cy="14" r="9" fill="var(--sunny)" />
          <text x="60" y="19" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--foreground)">₹</text>
          <rect x="40" y="74" width="8" height="10" rx="3" fill="var(--foreground)" opacity="0.5" />
          <rect x="72" y="74" width="8" height="10" rx="3" fill="var(--foreground)" opacity="0.5" />
        </svg>
      );
    case "scale":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <rect x="56" y="20" width="8" height="50" rx="4" fill="var(--primary)" />
          <rect x="30" y="70" width="60" height="8" rx="4" fill="var(--primary)" />
          <rect x="18" y="26" width="84" height="6" rx="3" fill="var(--mint)" />
          <path d="M28 32 L14 52 H42 Z" fill="var(--sunny)" />
          <path d="M92 32 L78 52 H106 Z" fill="var(--coral)" />
          <text x="28" y="70" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--foreground)">✓</text>
          <text x="92" y="70" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--foreground)">★</text>
        </svg>
      );
    case "target":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <circle cx="60" cy="45" r="34" fill="var(--coral)" />
          <circle cx="60" cy="45" r="24" fill="white" />
          <circle cx="60" cy="45" r="14" fill="var(--coral)" />
          <circle cx="60" cy="45" r="5" fill="var(--sunny)" />
          <line x1="60" y1="45" x2="96" y2="14" stroke="var(--foreground)" strokeWidth="3" />
          <path d="M92 10 L102 8 L98 18 Z" fill="var(--mint)" />
        </svg>
      );
    case "shield":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <path d="M60 12 L96 24 V48 C96 68 80 80 60 84 C40 80 24 68 24 48 V24 Z" fill="var(--mint)" />
          <path d="M46 46 L56 56 L76 34" stroke="white" strokeWidth="7" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <rect x="24" y="28" width="72" height="48" rx="10" fill="var(--primary)" />
          <rect x="24" y="28" width="72" height="14" rx="7" fill="var(--primary)" opacity="0.7" />
          <circle cx="82" cy="54" r="8" fill="var(--sunny)" />
          <rect x="70" y="20" width="30" height="12" rx="6" fill="var(--mint)" transform="rotate(-8 85 26)" />
        </svg>
      );
    case "cart":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <path d="M20 24 H32 L42 58 H84 L94 32 H36" stroke="var(--foreground)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <circle cx="48" cy="72" r="7" fill="var(--foreground)" opacity="0.7" />
          <circle cx="80" cy="72" r="7" fill="var(--foreground)" opacity="0.7" />
          <circle cx="78" cy="30" r="12" fill="var(--mint)" />
          <text x="78" y="35" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">₹</text>
        </svg>
      );
    case "bank":
      return (
        <svg {...s} viewBox="0 0 120 90">
          <path d="M60 12 L104 30 H16 Z" fill="var(--primary)" />
          <rect x="24" y="30" width="72" height="8" rx="2" fill="var(--primary)" opacity="0.7" />
          <rect x="30" y="42" width="12" height="26" rx="3" fill="var(--sunny)" />
          <rect x="54" y="42" width="12" height="26" rx="3" fill="var(--mint)" />
          <rect x="78" y="42" width="12" height="26" rx="3" fill="var(--coral)" />
          <rect x="18" y="70" width="84" height="8" rx="3" fill="var(--primary)" />
          <text x="60" y="39" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">₹</text>
        </svg>
      );
  }
}

/* ---------- Learn tab: module map ---------- */
export function ChildLearnScreen() {
  const { data, go } = useApp();
  const openSheet = useComingSoon((s) => s.openSheet);
  const mods = publishedModules(data);
  const totalLessons = mods.reduce((a, m) => a + publishedLessons(data, m.id).length, 0);
  return (
    <Screen>
      <AppHeader title="Learn" subtitle={`${mods.length} modules · ${totalLessons} lessons · badges`} />
      <ScrollArea className="px-4 pb-6">
        <div className="relative mx-auto w-full max-w-[300px] pt-2">
          {mods.map((m, i) => {
            const unlocked = moduleUnlocked(data, i);
            const pubCount = publishedLessons(data, m.id).length;
            const prog = moduleProgress(data, m.id);
            const done = prog.lessonsDone >= pubCount;
            return (
              <div key={m.id} className="relative flex flex-col items-center">
                {i > 0 && <div className="h-5 w-0.5 border-l-2 border-dashed border-primary/30" />}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => unlocked && go("moduleDetail", { moduleId: m.id })}
                  className={`flex w-[240px] items-center gap-3 rounded-3xl p-3.5 text-left shadow-md transition-colors ${
                    unlocked
                      ? done
                        ? "bg-mint text-primary-foreground"
                        : "bg-card"
                      : "bg-card/60 opacity-70"
                  }`}
                  style={{ alignSelf: i % 2 === 0 ? "flex-start" : "flex-end" }}
                >
                  <ProgressRing
                    progress={pubCount > 0 ? prog.lessonsDone / pubCount : 0}
                    size={48}
                    color={done ? "var(--primary-foreground)" : "var(--primary)"}
                  >
                    <span className="text-xl">{unlocked ? m.emoji : "🔒"}</span>
                  </ProgressRing>
                  <div className="min-w-0">
                    <p className={`truncate text-[14px] font-extrabold ${done ? "text-primary-foreground" : "text-foreground"}`}>
                      {m.order}. {m.title}
                    </p>
                    <p className={`truncate text-[11px] font-semibold ${done ? "opacity-80" : "text-muted-foreground"}`}>
                      {unlocked ? `${prog.lessonsDone}/${pubCount} lessons` : "Finish previous module"}
                    </p>
                  </div>
                  {!unlocked && <Lock className="ml-auto h-4 w-4 text-muted-foreground" />}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Practice card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => go("practiceHome")}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-mint-soft p-4 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-xl">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold">Practice with money games</p>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Practice money, not real · {data.practiceCoins} coins
            </p>
          </div>
          <Play className="h-4 w-4 text-primary" />
        </motion.button>

        {/* Badges card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => go("badges")}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-sunny-soft p-4 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sunny text-xl">
            🏅
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold">My badges</p>
            <p className="text-[11px] font-semibold text-muted-foreground">
              {data.unlockedBadges.length} of {BADGES.length} unlocked
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-foreground" />
        </motion.button>
        <button
          onClick={() => openSheet("Certificates and printable reports come in a later phase.")}
          className="mt-3 w-full text-center text-[12px] font-semibold text-muted-foreground underline"
        >
          Certificates coming soon
        </button>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Module detail ---------- */
export function ModuleDetailScreen() {
  const { data, go, back } = useApp();
  const params = useApp((s) => s.stack[s.stack.length - 1]?.params);
  const moduleId = (params?.["moduleId"] as number) ?? 1;
  const module = data.content.modules.find((m) => m.id === moduleId) ?? data.content.modules[0]!;
  const lessons = publishedLessons(data, module.id);
  const prog = moduleProgress(data, module.id);
  const pubCount = lessons.length;

  return (
    <Screen>
      <AppHeader title={module.title} subtitle={module.blurb} onBack={back} />
      <ScrollArea className="px-4 pb-6">
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${prog.lessonsDone >= pubCount ? "bg-mint-soft" : "bg-violet-soft"}`}>
          <span className="text-3xl">{module.emoji}</span>
          <div>
            <p className="text-[13px] font-extrabold text-primary">
              {prog.lessonsDone}/{pubCount} lessons complete
            </p>
            <p className="text-[11px] font-semibold text-primary/70">
              Each lesson = a story + a quiz
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {lessons.map((l, i) => {
            const unlocked = i <= prog.lessonsDone;
            const done = i < prog.lessonsDone;
            return (
              <motion.button
                key={l.id}
                {...(unlocked ? { whileTap: { scale: 0.98 } } : {})}
                onClick={() => unlocked && go("lessonPlayer", { moduleId, lessonIdx: i })}
                className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left shadow-sm ${
                  unlocked ? "bg-card" : "bg-card/60 opacity-70"
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${done ? "bg-mint-soft" : "bg-violet-soft"}`}>
                  {unlocked ? l.emoji : "🔒"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold">
                    {i + 1}. {l.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {unlocked ? (done ? "Completed ✓ · +50 pts" : "Tap to start") : "Complete previous lesson"}
                  </p>
                </div>
                {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Lesson player ---------- */
export function LessonPlayerScreen() {
  const { data, go, back } = useApp();
  const params = useApp((s) => s.stack[s.stack.length - 1]?.params);
  const moduleId = (params?.["moduleId"] as number) ?? 1;
  const lessonIdx = (params?.["lessonIdx"] as number) ?? 0;
  const module = data.content.modules.find((m) => m.id === moduleId) ?? data.content.modules[0]!;
  const lessons = publishedLessons(data, module.id);
  const lesson = lessons[lessonIdx] ?? lessons[0]!;
  const [idx, setIdx] = useState(0);

  if (!lesson) {
    return (
      <Screen>
        <AppHeader title="Lesson unavailable" onBack={back} />
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-[14px] text-muted-foreground">This lesson was unpublished by the content team.</p>
        </div>
      </Screen>
    );
  }

  const card: StoryCardData | undefined = lesson.contentType === "story" ? lesson.cards[idx] : undefined;
  const last = lesson.contentType === "video" || idx === lesson.cards.length - 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-violet-soft to-background">
      <div className="flex items-center justify-between px-4 pt-3">
        <button
          onClick={back}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[12px] font-bold text-primary">
          {module.emoji} {lesson.title}
        </p>
        <span className="w-9" />
      </div>
      {/* progress dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {lesson.contentType === "story" &&
          lesson.cards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-primary" : i < idx ? "w-1.5 bg-primary/60" : "w-1.5 bg-primary/25"
              }`}
            />
          ))}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            className="flex w-full flex-col items-center rounded-3xl bg-card p-6 text-center shadow-xl"
          >
            {card ? (
              <>
                <LessonArt art={card.art} />
                <h3 className="mt-4 font-display text-xl font-extrabold">{card.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {card.text}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <LessonArt art="bank" />
                <h3 className="mt-4 font-display text-xl font-extrabold">{lesson.title}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">Video lesson · {lesson.minutes} min</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between px-6 pb-8">
        <Button
          variant="soft"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <span className="text-[12px] font-bold text-muted-foreground">
          {lesson.contentType === "story" ? `${idx + 1} / ${lesson.cards.length}` : "Video"}
        </span>
        {last ? (
          <Button variant="mint" onClick={() => go("quiz", { moduleId, lessonIdx })}>
            Start quiz <Play className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setIdx(idx + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Quiz ---------- */
export function QuizScreen() {
  const { data, back } = useApp();
  const params = useApp((s) => s.stack[s.stack.length - 1]?.params);
  const completeLesson = useApp((s) => s.completeLesson);
  const fire = useFx((s) => s.fire);
  const moduleId = (params?.["moduleId"] as number) ?? 1;
  const lessonIdx = (params?.["lessonIdx"] as number) ?? 0;
  const module = data.content.modules.find((m) => m.id === moduleId) ?? data.content.modules[0]!;
  const lessons = publishedLessons(data, module.id);
  const lesson = lessons[lessonIdx] ?? lessons[0]!;
  const quiz = lesson ? getLessonQuiz(data, lesson.id) : undefined;

  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  if (!lesson || !quiz) {
    return (
      <Screen>
        <AppHeader title="Quiz unavailable" onBack={back} />
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-[14px] text-muted-foreground">This quiz is not published yet.</p>
        </div>
      </Screen>
    );
  }

  const questions = quiz.questions;
  const q = questions[qIdx] ?? questions[0]!;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
      setPicked(null);
    } else {
      const finalScore = score;
      const earned = 50 + finalScore * 10;
      completeLesson(moduleId, finalScore);
      setScore(finalScore);
      setPointsEarned(earned);
      setFinished(true);
      if (finalScore >= quiz.passMark) fire();
    }
  };

  if (finished) {
    const passed = score >= quiz.passMark;
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          className={`flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-xl ${
            passed ? "bg-mint-soft" : "bg-coral-soft"
          }`}
        >
          <Trophy className={`h-12 w-12 ${passed ? "text-primary" : "text-coral"}`} />
        </motion.div>
        <h2 className="mt-5 font-display text-2xl font-extrabold">
          {passed ? "Quiz passed! 🎉" : "Good try!"}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          You scored {score}/{questions.length} on "{lesson.title}"
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-sunny-soft px-4 py-2">
          <span className="text-xl">⭐</span>
          <span className="font-display text-lg font-extrabold text-foreground">
            +{pointsEarned} points
          </span>
        </div>
        <Button size="lg" className="mt-8 w-full" onClick={() => { back(); back(); }}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <Screen>
      <AppHeader title={`Quiz · ${lesson.title}`} subtitle={`Question ${qIdx + 1} of ${questions.length}`} onBack={back} />
      <ScrollArea className="px-6 pb-6">
        <p className="mt-2 font-display text-lg font-extrabold leading-snug">{q.q}</p>
        <div className="mt-5 space-y-3">
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const chosen = picked === i;
            return (
              <motion.button
                key={i}
                {...(picked === null ? { whileTap: { scale: 0.97 } } : {})}
                onClick={() => pick(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[14px] font-bold transition-colors ${
                  picked === null
                    ? "border-border bg-card"
                    : isCorrect
                      ? "border-mint bg-mint-soft text-primary"
                      : chosen
                        ? "border-coral bg-coral-soft text-coral"
                        : "border-border bg-card opacity-60"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[12px] font-extrabold text-primary">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{o}</span>
                {picked !== null && isCorrect && <CheckCircle2 className="h-5 w-5 text-mint" />}
                {picked !== null && chosen && !isCorrect && <XCircle className="h-5 w-5 text-coral" />}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-violet-soft p-4"
            >
              <p className="text-[13px] font-bold text-primary">
                {picked === q.answer ? "✅ Correct!" : "❌ Not quite."}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-primary/80">{q.explain}</p>
              <Button size="lg" className="mt-3 w-full" onClick={next}>
                {qIdx < questions.length - 1 ? "Next question" : "See my score"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Badges ---------- */
export function BadgesScreen() {
  const { data, back } = useApp();
  return (
    <Screen>
      <AppHeader title="My badges" subtitle={`${data.unlockedBadges.length} of ${BADGES.length} unlocked`} onBack={back} />
      <ScrollArea className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b, i) => {
            const unlocked = data.unlockedBadges.includes(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center rounded-2xl p-4 text-center shadow-sm ${
                  unlocked ? "bg-sunny-soft" : "bg-card opacity-60"
                }`}
              >
                <span className={`text-4xl ${unlocked ? "" : "grayscale"}`}>
                  {unlocked ? b.emoji : "🔒"}
                </span>
                <p className="mt-2 text-[13px] font-extrabold">{b.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {b.description}
                </p>
                {unlocked && <InfoPill tone="mint">Unlocked!</InfoPill>}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </Screen>
  );
}
