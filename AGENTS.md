<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# BachpanSe prototype

- The app is a single-page mobile prototype rendered inside a phone frame at `/` (TanStack Start). Navigation is an in-memory Zustand screen stack in `src/lib/bachpanse/store.ts`, NOT TanStack Router routes — keep all screen navigation on that stack and don't add routes for its screens.
- All prototype data is mock-only, client-side, persisted to localStorage under key `bachpanse-demo-v1`. No backend, no auth, no real accounts.
- Money math must stay consistent: balance = sum of transactions, goal allocations count as Money-out entries with category `Goal`; adding to a goal debits the available balance and credits the goal.
- Parent and child demo share one dataset (child demo is the same data viewed as Divya); parent approvals (task approve/reject) and child actions mutate the same store.
- The page shows a view toggle above the frames: "Mobile App" (existing phone frame) | "Admin Panel (LMS)" (desktop browser frame, fixed 1280×800 logical size, CSS-transform scaled). Both views stay mounted and keep their own state; the selected view is remembered in localStorage (`bachpanse-view`).
- The LMS (src/screens/bachpanse/lms/) navigates with local Zustand state in its state.ts — no router, no TanStack routes. Its toasts/dialogs render inside the browser frame.
- Learning content (modules, lessons, quizzes, challenges) lives in `AppData.content` in the shared store; the child app renders ONLY items with status "published" (see publishedModules/publishedLessons in store.ts), and lesson progress caps at the published-lesson count of a module. `resetDemo` reseeds the LMS content too.
- The uploaded user-flows document is bundled raw (`src/screens/bachpanse/user-flows.html`, imported with `?raw`) and shown in a full-screen iframe overlay from the fixed bottom-right "User Flow" button — never route to it or serve it as a page.
