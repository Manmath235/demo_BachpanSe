# BachpanSe: PWA + Admin panel on Supabase

Two separate apps share one Supabase backend and one codebase:

| App | What it is | Dev | Build |
| --- | --- | --- | --- |
| **PWA** (repo root) | Installable kids/parents app. Full-screen on phones, phone frame on desktop. | `npm run dev` (port 8080) | `npm run build` |
| **Admin panel** (`admin/`) | Content studio (modules, lessons, quizzes, challenges) and a read-only Learners dashboard. | `npm run admin:dev` (port 5174) | `npm run admin:build` (output `admin/dist`) |

## How they are connected

- The admin edits content. Every change is saved to the `content_items` table in Supabase.
- The PWA reads **published** content from that table, so publishing or unpublishing in the admin changes what children see. It updates live (realtime), on app focus, and every 60 s. Content is cached on the device, so the app keeps working offline.
- The PWA uploads each family's progress (points, lessons done, badges, balance, tasks) to the `families` table. The admin's **Learners** page shows it, read-only.
- Row-level security (in `supabase/schema.sql`) means: the app can only see published content and its own family row; only admins can write content or see all families.

Without the env vars both apps still run as the old local-only prototype.

## One-time setup

1. Create a project at supabase.com.
2. **Authentication → Providers → Anonymous sign-ins → enable** (the PWA uses one anonymous identity per device).
3. Open the **SQL editor** and run `supabase/schema.sql`.
4. **Authentication → Users → Add user** (email + password) for each content admin, then in the SQL editor:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
5. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
6. `npm install`, then start either app. The first admin login seeds Supabase with the bundled starter content.

## Deploying

Deploy the two builds separately (for example PWA on Lovable/Cloudflare, admin as a static site from `admin/dist`). Set the same two env vars on both. Serve over HTTPS so the service worker and install prompt work.

## Known limits

- Parent and child share one device/identity: the demo flow treats them as one family on one install. Linking a parent phone and a child phone to the same family needs real phone-number (OTP) auth, which is not built.
- Phone OTP login screens in the app are still simulated.
- PWA icons are upscaled from the 64 px favicon. Replace `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `apple-touch-icon.png` with real artwork.
- The full logo image is hosted by Lovable and only loads there; elsewhere the app falls back to the icon.
- Lesson videos are mock (no upload storage yet).
