# "User Flow" button with the uploaded flows document

## What we're building

A fixed **"User Flow"** button in the bottom-right corner of the page (outside the phone/desktop frames, visible in both the Mobile App and Admin Panel views). Clicking it opens a full-screen overlay that shows the uploaded user-flows document exactly as it was designed — with its own tabs, diagrams, legend and dark mode — plus a prominent close button to return to the prototype.

## How it works

```text
Prototype page (as today)
+---------------------------------------------+
|   [Mobile App] [Admin Panel (LMS)]          |
|                                             |
|        (phone / desktop frame)              |
|                                    [User Flow]  <- fixed pill, bottom-right
+---------------------------------------------+

Clicking "User Flow" -> full-screen overlay (z-top)
+---------------------------------------------+
|  BachpanSe User Flows            [ Close ]  |
|---------------------------------------------|
|                                             |
|   uploaded flows page, inside an iframe     |
|   (tabs, diagrams, legend all interactive)  |
|                                             |
+---------------------------------------------+
```

## Implementation

1. **Copy the uploaded document into the app** — `user-uploads://BachpanSe_User_Flows.html` → `src/screens/bachpanse/user-flows.html`. It is bundled via Vite's `?raw` import, so no routing or static-serving changes are needed and it works the same in the preview and after publishing.
2. **New component `UserFlowButton` in `src/screens/bachpanse/user-flow.tsx`**:
   - Fixed pill button, bottom-right corner (`bottom-4 right-4`, above everything with a high z-index), labelled "User Flow" with a flow/diagram icon, styled to match the prototype (white pill, subtle shadow, primary accent).
   - Clicking toggles a full-screen overlay: a slim header bar ("BachpanSe User Flows" + Close button) and an `<iframe srcDoc={...}>` filling the rest. The iframe gives the document its own scroll, fonts (Google Fonts load inside it) and dark-mode handling without affecting the prototype's styles.
   - The overlay stays mounted once opened (state preserved when reopened); `Escape` also closes it.
3. **Mount the button in `src/screens/bachpanse/app.tsx`** — one line, so it appears identically over both the Mobile App and LMS views.
4. **Project note** — add one line to `AGENTS.md` recording that the user-flows document is bundled raw and shown in an overlay, so future edits know not to route to it.

## Verification

- Playwright: open the preview, confirm the button sits at the bottom-right, click it, confirm the overlay shows the flows page (header "App entry and roles", tab strip with 15 flows), click a couple of tabs, close, and confirm the prototype is unchanged underneath. No console errors; typecheck, tests and build clean.

Mock-only rule untouched: the document is static content, no data or backend involved.
