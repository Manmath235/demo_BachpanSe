# BachpanSe Admin Panel (LMS) — Plan

## Summary
Add a desktop LMS view beside the existing phone view, with a view toggle above the frames. Both views share one content dataset in the existing Zustand store, so publishing/unpublishing in the LMS changes what the child app shows. No existing mobile screen, flow, or styling changes except that Learn/Practice now read content from the store.

## 1. Shared content data
- New `src/lib/bachpanse/content.ts`: content types (`ContentStatus = "published" | "draft"`, age bands "10–12" | "13–15" | "16–17") and `seedContent()` derived from the existing static `MODULES`, `SHOP_ITEMS`, and `SCENARIOS` in lessons.ts / practice.tsx.
- Content shape (stored inside `AppData.content`):
  - `lmsModules`: id, order, title, emoji, blurb, ageBand, status, description.
  - `lessons`: id, moduleId, order, title, emoji, description, minutes, contentType ("story" | "video"), cards[] (art + title + text; art reuses the 7 existing SVG arts plus one new 8th art), videoName/videoDuration (mock), status, updatedAt.
  - `quizzes`: one per published lesson, linked by lessonId, passMark (2 of 3), questions (text, 2–4 options, correct index, explanation).
  - `challenges`: type "shop" (budget 500, 8 items with name/price/need) and "save" (3 scenarios with choices + outcomes), status, linked module.
- Seed per spec: 6 modules (existing titles), 3 lessons each; modules 1–5 published; module 6 has 2 published lessons and 1 draft titled "Never share your OTP" (content from the existing OTP lesson). Every published lesson keeps its existing 3-question quiz. Challenges "Shop smart" (8 items) and "Save or spend" (3 scenarios), both published.
- Store (`store.ts`): add `content` to `AppData` and actions: updateModule, reorderModules, addLesson/updateLesson/deleteLesson, setLessonStatus, reorderLessonCards, add/update/deleteQuiz, setQuizStatus, updateChallenge, setChallengeStatus, resetLmsContent. Persist version → 4; migrate injects `content` into previously saved data while keeping the user's existing money/family data.
- Child app reads store content:
  - `child-learn.tsx`: module map, module detail, lesson player, quiz render from `data.content` — only Published modules/lessons appear; lesson unlocking adapts to the number of published lessons; draft lessons never render.
  - `practice.tsx`: Shop smart items/budget and Save-or-spend scenarios read from `data.content`.
  - `resetDemo` already reseeds all of `AppData`, so "Reset demo data" also resets LMS content (verified).

## 2. View toggle + desktop frame
- `app.tsx`: segmented toggle ("Mobile App" | "Admin Panel (LMS)") with Phone/Monitor lucide icons, centered above the frames — the only element outside the frames. Framer-motion crossfade between views; each view keeps its own state (LMS auth/page state lives in its own non-persisted Zustand store, phone state unchanged). Last view remembered in localStorage (try/catch).
- New `src/components/bachpanse/lms/frame.tsx`: browser chrome (3 window dots, address bar "BachpanSe Admin"), fixed 1280×800 logical size, scale = `min((innerHeight*0.88)/860, (innerWidth*0.94)/1300)` recomputed on resize — same approach as the phone frame. Only the LMS content scrolls; toasts/dialogs/dropdowns render inside the frame.

## 3. LMS screens (new `src/screens/bachpanse/lms/`)
Note: no react-router — the prototype uses no router, so the LMS uses simple local page state (same intent as the requested MemoryRouter, no new dependency).
- **Login**: email + password, "Log in", hint "Demo: any email and password" → Lessons page.
- **Layout**: left sidebar (Modules, Lessons, Quizzes, Challenges; active highlighted), top bar with page title, "BachpanSe Content Team" avatar, Log out → Login.
- **Modules**: table (order, name, age band, lesson count, status pill); New/Edit opens a side drawer; up/down reorder buttons; publish/draft status.
- **Lessons**: table (title, module, age band, content type, status pill, last updated); search + module/age/status filters; row actions Edit, Preview, Publish/Unpublish, Delete (in-page confirm dialog, never a browser alert); "New lesson".
- **Lesson editor**: title, module + age band dropdowns, description, minutes; content type switch — Story cards (add/delete/reorder cards with 8-SVG illustration picker) or Video (mock upload progress bar → thumbnail with name and duration); live phone-shaped Preview panel with Next/Back stepping; footer "Save as draft"/"Publish" with toasts; "Unsaved changes" label; in-panel leave confirmation.
- **Quizzes**: table (name, lesson, question count, pass mark, status); editor with linked lesson, pass mark, per-question options/correct-answer radio/explanation, add/delete/reorder; validation messages ("Mark the correct answer for question 2").
- **Challenges**: fixed note "Practice coins are not real money and do not affect the child's wallet."; table (name, type, module, coin budget, status); editors for Shop smart (budget, items with Need/Want, scoring message) and Save or spend (scenarios with choices + outcomes).
- **Look**: existing brand tokens, calmer — white content area, light lavender sidebar, compact tables, status pills; subtle animations (page fade, row hover, toast slide, upload progress, 300ms skeleton shimmer per list — reuse existing `skeleton-shimmer` utility).
- Every control works; unbuilt spots open a "Coming in a later phase" panel inside the frame (reuse `useComingSoon` pattern, LMS-styled).

## 4. Publish flow (spec §5)
- Publish/unpublish toggles lesson status in the store; the child Learn tab reflects it on next open (publish toast: "Published. Switch to Mobile App to see it in the child's Learn tab.").

## 5. Tests + verification
- Extend `src/test/auth-flow.test.ts` (or a new `lms-content.test.ts`): (1) draft lessons never appear in the child module map; (2) publishing a draft makes it appear in the child's published-lessons selector; (3) unpublishing removes it; (4) `resetDemo` reseeds LMS content.
- Playwright: toggle switch both ways, publish the module-6 draft in the LMS → confirm it appears in child Learn; unpublish → confirm it disappears.
- Typecheck + vitest + build clean before finishing.
