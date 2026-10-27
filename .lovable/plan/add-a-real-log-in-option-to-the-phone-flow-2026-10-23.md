# Add a real Log in option to the phone flow

## Problem
Today every phone-number entry is treated as a sign-up: phone → OTP → "Who's using BachpanSe?" role question → full onboarding. A returning user with the same number has to walk through signup again (the direct-to-dashboard shortcut only fires from the splash screen while still signed in). The user wants a proper Log in path alongside Sign up.

## Design
A registered account is remembered in the demo store, and the phone screen gets a Log in / Sign up toggle:

```text
Log in mode:   phone → OTP → straight to your dashboard (parent or child)
Sign up mode:  phone → OTP → role question → onboarding (as today)
```

## Changes

### 1. Store — `src/lib/bachpanse/store.ts`
- Add persisted state `account: { phone: string; role: "parent" | "child" } | null`, defaulting to a demo account (`98765 43210`, parent) so Log in works on a fresh browser and for anyone with existing localStorage (persist's shallow merge keeps the default when the key is absent).
- `signInComplete(role)` (sign-up path) also records the account: `{ phone: session.phone, role }`.
- `logout()` keeps `account` (so you can log back in) and lands on `loginPhone` in Log in mode.
- Add non-persisted `authMode: "login" | "signup"` plus `setAuthMode`, set by the phone screen and read by the OTP screen.
- Add `account` to `partialize`.

### 2. Phone screen — `LoginPhoneScreen` in `src/screens/bachpanse/auth.tsx`
- Segmented pill toggle: **Log in** (default) | **Sign up**.
- Copy adapts: Log in → "Welcome back", Sign up → "Sign in / Sign up" style intro as today.
- Validation per mode (normalized 10-digit compare):
  - Log in with an unregistered number → inline error "No account found with this number. Try Sign up." (tappable to switch).
  - Sign up with an already-registered number → inline error "This number already has an account. Log in instead." (tappable to switch).

### 3. OTP screen — `LoginOtpScreen`
- Title: "Welcome back" (Log in) vs "Create your account" (Sign up).
- On Verify:
  - Log in → `signInComplete(account.role)`, then `reset()` straight to `parentHome` or `childHome`.
  - Sign up → `go("roleSelect")` exactly as today.

### 4. Welcome screen — small touch
- "Skip" still goes to `loginPhone` (now defaulting to Log in); no other change.

### 5. Tests
- Extend the existing vitest store test: logging in with the registered phone signs in and routes to the parent dashboard; logging in with an unknown phone does not sign in (error path); signing up records the account; logout keeps the account.

## Verification
- Typecheck (`tsgo --noEmit`) and `bunx vitest run`.
- Playwright in the preview: fresh state → phone screen defaults to Log in → enter 98765 43210 → OTP → lands directly on the parent dashboard; repeat with an unknown number to see the "No account found" error; then Sign up path still reaches the role question and onboarding; logout → Log in again works.
