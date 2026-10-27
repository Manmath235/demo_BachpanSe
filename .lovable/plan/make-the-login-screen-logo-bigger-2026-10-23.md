# Make the login-screen logo bigger

## Change
The BachpanSe logo at the top of the phone-number screen (Log in / Sign up) currently renders small (`h-7`). The screen has free space below the button, so size it up to the large size (`h-16`) used elsewhere, and nudge the heading down to keep the spacing balanced.

- `src/screens/bachpanse/auth.tsx` — `LoginPhoneScreen`: `<Logo size="sm" />` → `<Logo size="lg" />`; adjust the top padding/margins so the heading, toggle, field and button still fit comfortably without scrolling.

No other screens change (the OTP and role screens keep their current sizes).

## Verification
- Typecheck passes, build OK.
- Playwright screenshot of the login screen to confirm the larger logo fits with no overflow.
