# BachpanSe — Clickable High-Fidelity Mobile Prototype

A pure front-end prototype of the BachpanSe financial-learning app for children (10–17) and parents in India. No backend: all data is mock data in Zustand, persisted to localStorage. Everything renders at `/` inside a realistic iPhone 15 frame; the URL never changes.

## Stack adaptations (from the spec's React + MemoryRouter + Zustand)

- This project is a TanStack Start app and TanStack Router is fixed — react-router-dom / MemoryRouter cannot be installed. Instead, navigation runs through an **in-memory screen state machine in Zustand** (a `screen` + `params` + `history` stack), so navigation stays inside the phone frame and the browser URL never changes. This meets the spec's intent exactly.
- Install `framer-motion` and `zustand` (not yet in package.json). `lucide-react` is already installed.
- Fonts Nunito + Inter loaded via `<link>` tags in `src/routes/__root.tsx` head (never `@import` in CSS).

## Structure

```
src/
  routes/index.tsx            -> replaces placeholder; renders <BachpanSeApp />
  styles.css                  -> brand tokens (violet #6C4CF1, mint #2ED3A0, yellow #FFC93C,
                                 coral #FF6B6B, bg #F7F5FF, text #1E1B3A, Nunito/Inter)
  lib/bachpanse/
    types.ts                  -> Transaction, Goal, Task, Lesson, Badge, Role types
    mock-data.ts              -> seed data exactly per spec (Priya Sharma, Aarav, entries)
    store.ts                  -> Zustand store, persisted to localStorage; derived selectors
                                 (balance, month in/out totals, goal progress) computed from
                                 entries, never hardcoded; resetDemoData() restores seed
    format.ts                 -> ₹ Indian formatting (Intl en-IN)
    screens.ts                -> screen registry + navigation helpers (push/back/tab)
  components/bachpanse/       -> PhoneFrame, StatusBar, AppHeader, BottomTabBar, BottomSheet,
                                 Toast, Confetti, BalanceCard, TransactionRow, GoalCard,
                                 TaskCard, Keypad, ProgressRing, CountUp, EmptyState svg
  screens/bachpanse/          -> one file per screen (below)
```

## Screens & flows

**Shared:** Splash (1.5s animated logo) → Welcome carousel (3 slides, Skip/Next) → Role select (Parent/Child cards + "Demo shortcuts" jumping straight to either home).

**Parent:** onboarding (mobile +91 → 6-box OTP with "Demo OTP: any 6 digits", 30s resend timer → name → DPDP-style consent sheet with required checkbox, mock Privacy/How-we-use-data sheets, disabled continue → add child with DOB validation for ages 10–17 with the two exact rejection messages → invite screen with 6-char code BPS-XXXX, QR, mock share sheet). Home tabs: Home / Activity / Tasks / Profile.
- Home: child header with "View only" chip + tooltip, balance card with count-up, "Record money given" sheet (keypad, type, note, date → toast), learning progress, goals with progress rings, practice section labelled "Practice money, not real", recent 5 transactions.
- Activity: grouped list, in/out filters, month selector, read-only detail sheets (parent cannot edit child entries).
- Tasks: create task sheet; To do / Waiting for approval / Completed; Approve adds a Task-reward Money-in entry with confetti.
- Profile: consent details + mock Withdraw-consent confirmation sheet, toggles, invite code + QR, "Switch to Child demo", "Reset demo data", Log out.

**Child:** invite code entry or mock QR scanner (animated scan line, auto-succeeds after 2s) → welcome → 4-digit PIN set/confirm → 8 emoji avatar picker. Home tabs: Home / Learn / Money / Goals / Me.
- Home: greeting, streak flame, points, balance, quick actions (Add spending / My tasks / Practice), continue-learning card, daily challenge (1 quiz question, points).
- Learn: 6-module colourful path with locks in order; each module 3 lessons; lesson player = 4–6 swipeable animated story cards (inline SVG illustrations, progress dots); 3-question quiz with instant feedback, score screen, confetti on pass; badges section.
- Money: balance, in/out summary with animated chart by category, "Add spending" sheet (keypad, 6 category chips, note, date; over-balance = friendly warning but allowed), history with edit/delete of own entries.
- Goals: goal cards, new-goal sheet (name, emoji picker, target, date), "Add to goal" moving balance to goal; target reached → confetti + Goal-reached badge.
- Practice (clearly "not real", 1,000 coins): "Shop smart" (500-coin budget, 8 items, live remaining coins, needs-vs-wants feedback) and "Save or spend" (3 scenarios); results feed the parent's practice section.
- Me: avatar/name/age/points/streak/badges, "My privacy" sheet, Change PIN, Help, "Switch to Parent demo", Log out.

## Presentation rules

- Fixed 390×844 logical screen inside an iPhone frame (bezel, Dynamic Island, home indicator); fake status bar (9:41). Scale via CSS transform = `min((innerHeight*0.92)/900, (innerWidth*0.92)/440)`, recalculated on resize; page centered, `overflow: hidden` on html/body; outer page shows brand + "Interactive Prototype".
- Only the content area between header and tab bar scrolls, inside the phone, scrollbars hidden. Sheets/modals/toasts/confetti confined to the frame. Long names ("Aarav Venkataraman Iyer") and ₹1,25,000-style amounts truncate cleanly. No horizontal scroll anywhere.
- Framer-motion: screen slide transitions, sheet fade/slide-up, press-scale buttons, count-up balances, animated rings/bars, confetti, streak/badge animations, 400ms skeleton shimmer on dashboard load, toasts on every save.
- Anything not built opens a "Coming in a later phase" bottom sheet. Every screen has back navigation or tabs; no dead ends.

## Implementation order

1. Install deps; tokens + fonts; PhoneFrame/status bar/outer page; store + mock data + formatting.
2. Shared components (sheets, toasts, keypad, rings, confetti) and navigation machine.
3. Shared entry screens; parent flow; child flow; practice challenges; lesson/quiz content.
4. Verification: Playwright at 390×844 — walk splash→role select→both demos, add money/spending, task approval, goal flow, quiz pass; confirm no overflow outside frame, all buttons respond, back navigation everywhere, long-name/large-amount truncation; check build log and console errors.

## Notes

- No real backend, auth, or payments; onboarding OTP/consent are mocked and clearly labelled demo-only.
- No `og:image` (no meaningful absolute hero); index route gets proper unique head metadata.
