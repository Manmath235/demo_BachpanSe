# Fix role select screen — too much content, no structure

## What's wrong today
The "Who's using BachpanSe today?" screen stacks four competing blocks (two huge color cards with giant emoji boxes, plus a dashed "Demo shortcuts" panel that repeats the same two roles, plus a help link). The parent/child choice gets no visual priority, the shortcut panel duplicates it, and everything is crammed at the top with dead space below.

## New structure (single file: `src/screens/bachpanse/shared.tsx`, `RoleSelectScreen`)
```text
┌──────────────────────────────┐
│         logo (h-10)          │
│  Who's using BachpanSe today?│
│   one short subtitle line    │
│                              │
│  ┌────────────────────────┐  │
│  │ 👩‍👧  I'm a Parent      │  │  ← primary card (violet)
│  │ short one-line benefit │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🧒  I'm a Child        │  │  ← secondary card (mint)
│  │ short one-line benefit │  │
│  └────────────────────────┘  │
│                              │
│  "Explore faster: Parent ·   │  ← one subtle footer line
│   Child · how demo works?"   │
└──────────────────────────────┘
```

## Changes
1. **Role cards become compact horizontal rows**: emoji in a modest rounded square (h-12) on the left, title + one-line description on the right. Parent card stays primary (violet, slightly larger emphasis); child card mint. No giant 64px emoji boxes, no drop-shadow stacking.
2. **Remove the dashed "Demo shortcuts" panel entirely** — it duplicated the two role cards.
3. **Replace it with one subtle footer row** pinned toward the bottom of the screen: `Skip ahead: Parent demo · Child demo` as small text buttons (same navigation as today, parent/child go straight to their home screens), and a separate tiny `How does demo data work?` link that keeps the existing "coming soon" sheet.
4. **Vertical rhythm**: logo + heading block at top, cards in the middle, footer pinned near the bottom with the home-indicator gap — content fills the phone frame instead of huddling at the top with empty space below.
5. Keep all navigation behavior and store calls exactly as they are (`parentPhone`, `childCode`, `parentHome`, `childHome`, coming-soon sheet).

## Verification
- Playwright: skip the intro, screenshot the role select screen, confirm the new layout fits without scrolling and footer links still navigate (click Parent demo → parent home; Child demo → child home).
- Run `bunx tsgo --noEmit` and the existing vitest suite.
