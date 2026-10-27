# Use the BachpanSe logo in the QR scanner screen

## Context
On the child's "Scan QR" screen, the mock camera viewfinder shows a 🐷 emoji in the white square. The user wants the elephant BachpanSe logo there instead.

## Change
In `src/screens/bachpanse/child-onboarding.tsx` (`ChildScanScreen`, line ~70):
- Replace the 🐷 emoji with the logo image (`logoAsset` from `@/assets/bachpanse-logo.png.asset.json`, same pointer the shared `Logo` component uses) at h-24 with a w-auto fit, so it fills the h-44 viewfinder square nicely.
- Keep the scan animation, border and everything else untouched.

Other 🐷 emojis in lessons/practice screens are content (piggy-bank themed lessons), not the logo — leave them alone.

## Verification
Playwright: child onboarding → Scan QR instead → screenshot the viewfinder to confirm the logo renders, no console errors; run `bunx tsgo --noEmit`.
