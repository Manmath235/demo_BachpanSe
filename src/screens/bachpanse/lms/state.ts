import { create } from "zustand";
import type { Challenge, LmsLesson, Quiz } from "@/lib/bachpanse/content";

export type ViewId = "mobile" | "lms";
export type LmsPage = "modules" | "lessons" | "quizzes" | "challenges";

const VIEW_KEY = "bachpanse-view";

function loadView(): ViewId {
  try {
    return localStorage.getItem(VIEW_KEY) === "lms" ? "lms" : "mobile";
  } catch {
    return "mobile";
  }
}

function saveView(v: ViewId) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {
    /* private mode — view just won't be remembered */
  }
}

interface LmsUiState {
  view: ViewId;
  setView: (v: ViewId) => void;
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  page: LmsPage;
  pendingPage: LmsPage | null;
  confirmNav: (p: LmsPage) => void;
  cancelNav: () => void;
  acceptNav: () => void;
  // lesson editor
  lessonDraft: LmsLesson | null;
  lessonIsNew: boolean;
  lessonDirty: boolean;
  lessonLeaveAsk: boolean;
  videoProgress: number | null;
  openLessonEditor: (lessonId: string | "new", seed: LmsLesson) => void;
  patchLessonDraft: (patch: Partial<LmsLesson>) => void;
  closeLessonEditor: () => void;
  askLeaveLesson: () => void;
  cancelLeaveLesson: () => void;
  // quiz editor
  quizDraft: Quiz | null;
  quizDirty: boolean;
  quizError: string;
  quizLeaveAsk: boolean;
  openQuizEditor: (quiz: Quiz | null) => void;
  patchQuizDraft: (patch: Partial<Quiz>) => void;
  closeQuizEditor: () => void;
  askLeaveQuiz: () => void;
  cancelLeaveQuiz: () => void;
  // challenge editor
  challengeDraft: Challenge | null;
  challengeDirty: boolean;
  challengeLeaveAsk: boolean;
  openChallengeEditor: (challenge: Challenge) => void;
  patchChallengeDraft: (patch: Partial<Challenge>) => void;
  closeChallengeEditor: () => void;
  askLeaveChallenge: () => void;
  cancelLeaveChallenge: () => void;
}

export const useLmsUi = create<LmsUiState>((set, get) => ({
  view: loadView(),
  setView: (v) => {
    saveView(v);
    set({ view: v });
  },
  signedIn: false,
  signIn: () => set({ signedIn: true, page: "lessons" }),
  signOut: () =>
    set({
      signedIn: false,
      page: "lessons",
      pendingPage: null,
      lessonDraft: null,
      quizDraft: null,
      challengeDraft: null,
    }),
  page: "lessons",
  pendingPage: null,
  confirmNav: (p) => {
    if (p === get().page) return;
    const s = get();
    const dirty =
      s.lessonDirty && s.lessonDraft !== null
        ? true
        : s.quizDirty && s.quizDraft !== null
          ? true
          : s.challengeDirty && s.challengeDraft !== null;
    if (dirty) set({ pendingPage: p });
    else set({ page: p, lessonDraft: null, quizDraft: null, challengeDraft: null });
  },
  cancelNav: () => set({ pendingPage: null }),
  acceptNav: () =>
    set((s) => ({
      pendingPage: null,
      page: s.pendingPage ?? s.page,
      lessonDraft: null,
      quizDraft: null,
      challengeDraft: null,
    })),

  lessonDraft: null,
  lessonIsNew: false,
  lessonDirty: false,
  lessonLeaveAsk: false,
  videoProgress: null,
  openLessonEditor: (lessonId, seed) =>
    set({
      lessonDraft: { ...seed },
      lessonIsNew: lessonId === "new",
      lessonDirty: false,
      lessonLeaveAsk: false,
      videoProgress: null,
    }),
  patchLessonDraft: (patch) =>
    set((s) => ({
      lessonDraft: s.lessonDraft ? { ...s.lessonDraft, ...patch } : s.lessonDraft,
      lessonDirty: true,
    })),
  closeLessonEditor: () =>
    set({ lessonDraft: null, lessonDirty: false, lessonLeaveAsk: false, videoProgress: null }),
  askLeaveLesson: () => set({ lessonLeaveAsk: true }),
  cancelLeaveLesson: () => set({ lessonLeaveAsk: false }),

  quizDraft: null,
  quizDirty: false,
  quizError: "",
  quizLeaveAsk: false,
  openQuizEditor: (quiz) =>
    set({ quizDraft: quiz ? { ...quiz } : null, quizDirty: false, quizError: "", quizLeaveAsk: false }),
  patchQuizDraft: (patch) =>
    set((s) => ({
      quizDraft: s.quizDraft ? { ...s.quizDraft, ...patch } : s.quizDraft,
      quizDirty: true,
    })),
  closeQuizEditor: () => set({ quizDraft: null, quizDirty: false, quizError: "", quizLeaveAsk: false }),
  askLeaveQuiz: () => set({ quizLeaveAsk: true }),
  cancelLeaveQuiz: () => set({ quizLeaveAsk: false }),

  challengeDraft: null,
  challengeDirty: false,
  challengeLeaveAsk: false,
  openChallengeEditor: (challenge) =>
    set({ challengeDraft: { ...challenge }, challengeDirty: false, challengeLeaveAsk: false }),
  patchChallengeDraft: (patch) =>
    set((s) => ({
      challengeDraft: s.challengeDraft ? { ...s.challengeDraft, ...patch } : s.challengeDraft,
      challengeDirty: true,
    })),
  closeChallengeEditor: () =>
    set({ challengeDraft: null, challengeDirty: false, challengeLeaveAsk: false }),
  askLeaveChallenge: () => set({ challengeLeaveAsk: true }),
  cancelLeaveChallenge: () => set({ challengeLeaveAsk: false }),
}));
