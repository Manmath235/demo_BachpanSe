# Pin the PIN keypad to the bottom of the screen

## Context
On the child's "Create your PIN" screen the keypad floats in the middle of the screen with dead space below. The user wants the keypad at the bottom, like a real phone keyboard, with the PIN display aligned above it.

## Change
In `src/screens/bachpanse/child-onboarding.tsx` (`ChildPinScreen`):
- Replace the `ScrollArea` wrapper with a plain flex column that fills the space under the header.
- The lock icon, "Choose a 4-digit PIN" / "Confirm your PIN" prompt and the four dots stay at the top.
- Move the keypad into a bottom-pinned block (`mt-auto`), so it sits flush at the bottom of the screen above the home indicator, with the existing bottom padding.
- Constrain the keypad to a centered, phone-like width (~max 280px) so it reads as a keypad rather than stretching edge to edge.

Keypad buttons, stage logic (set → confirm → error shake) and store calls stay untouched.

## Verification
Playwright: child onboarding → enter invite code → continue to PIN screen, screenshot to confirm keypad sits at the bottom; type a PIN through the keypad, confirm the flow still advances to the confirm stage and then to avatar; `bunx tsgo --noEmit`; no console errors.
