# Phone sign-in before role selection

## Goal
Replace the "role select" entry screen with a phone-number login/sign-in flow. Splash → welcome tour → phone sign-in → OTP → role question → the existing per-role flow. The app remembers the signed-in session across reloads.

## Flow after the change

```text
splash ──► (returning session? ──► parent/child dashboard)
   │
   └─► welcome tour (3 slides, kept) ──► Login screen (phone + OTP)
                                              │
                                     verify OTP (any 6 digits, demo)
                                              │
                                     "Who's using BachpanSe today?"
                                     ├─ Parent ──► name → consent → add child → invite → parent dashboard
                                     └─ Child ──► invite code / scan → child onboarding → child dashboard
```

## Changes

1. **New auth screens** — `src/screens/bachpanse/auth.tsx`
   - `LoginPhoneScreen`: BachpanSe logo, "Sign in / Sign up" heading, +91 prefix, 10-digit phone input, "Send OTP" button. Back arrow returns to the welcome tour. Reuses the existing input/field styling from `shared.tsx`.
   - `LoginOtpScreen`: 6-digit OTP boxes (existing `CodeBoxes`), resend timer, demo hint "any 6 digits work". Verify → role question.
   - Move `RoleSelectScreen` here from `shared.tsx` and rework it into the post-OTP role step: keep the two role cards (Parent → `parentName`, Child → `childCode`), drop the "Skip ahead" demo footer (login now precedes this screen, shortcuts no longer make sense). Back arrow returns to the OTP screen.

2. **Remove parent phone/OTP screens** — delete `ParentPhoneScreen` and `ParentOtpScreen` from `parent-onboarding.tsx` (superseded by the shared auth screens); remaining parent onboarding (name, consent, add child, invite) unchanged.

3. **Store updates** — `src/lib/bachpanse/store.ts`
   - Screen ids: replace `parentPhone`/`parentOtp` with `loginPhone`/`loginOtp`; keep `roleSelect` (now post-OTP).
   - Add a persisted `session: { signedIn: boolean }` next to `role`; both persisted in `partialize`.
   - `SplashScreen`: if `session.signedIn && role !== "none"`, go straight to that role's dashboard; otherwise to the welcome tour.
   - `WelcomeScreen`: Skip and "Get started" now go to `loginPhone`.
   - `logout()`: clear `session.signedIn` and `role`, reset to `loginPhone`.

4. **Sign-in completion** — role cards call `setRole(...)` and mark `session.signedIn = true` before entering the per-role flow, so a reload mid-demo still restores the dashboard.

5. **App registration** — `src/screens/bachpanse/app.tsx`: wire the new screens into `SCREENS`, remove the deleted parent onboarding screens.

## Out of scope
- No real SMS, backend, or accounts — everything stays mock in-browser demo data (key `bachpanse-demo-v1`).
- Existing per-role onboarding steps, money math, and shared dataset are untouched.

## Verification
- Playwright walk-through: fresh state → welcome → login (any 10 digits) → OTP (any 6) → role question → parent flow reaches dashboard; child path reaches child code screen.
- Reload check: session persists to the dashboard; Profile logout returns to the login screen.
- Typecheck and existing tests pass.
