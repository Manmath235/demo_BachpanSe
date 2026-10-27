# Rename demo accounts: Aditya (parent) and Divya (child)

The demo logins are being rebranded: **98765 43210 = Aditya (parent)**, **98765 43211 = Divya (child)**. Today the seed data still says Priya Sharma / Aarav Sharma, and the login hint doesn't say who each number belongs to.

## Changes

1. **Seed data (`src/lib/bachpanse/mock-data.ts`)**
   - `parentName`: "Priya Sharma" → "Aditya Sharma"
   - `childName`: "Aarav Sharma" → "Divya Sharma"
   - Keep surname Sharma so all "first name" displays (`Aditya`, `Divya`) and the family link read naturally. Full names can be swapped for bare "Aditya"/"Divya" if preferred.

2. **Login hint (`src/screens/bachpanse/auth.tsx`)**
   - Change to: "Demo: Parent Aditya 98765 43210 · Child Divya 98765 43211" so each number is labeled with its owner.

3. **Sample placeholders (`src/screens/bachpanse/parent-onboarding.tsx`)**
   - "e.g. Priya Sharma" → "e.g. Aditya Sharma"; "e.g. Aarav Venkataraman Iyer" → "e.g. Divya Sharma".

4. **Reset copy (`src/screens/bachpanse/parent-profile.tsx`)**
   - Update the "restores the original demo data" text to name Aditya and Divya.

5. **Existing saved previews (`src/lib/bachpanse/store.ts`)**
   - Bump persist version 1 → 2 with a migrate that patches stored `parentName`/`childName` to the new names, so the running preview shows them without a manual reset (invite code 492761 patch stays).

6. **Test (`src/test/auth-flow.test.ts`)**
   - Add a test asserting the seed maps parent 9876543210 → Aditya and child 9876543211 → Divya (names and roles).

## Verification

- Typecheck, vitest, build.
- Playwright: login screen hint shows both labeled numbers; parent login → "Aditya" dashboard; child login (98765 43211) → "Hi Divya!" child home; reload keeps new names.
