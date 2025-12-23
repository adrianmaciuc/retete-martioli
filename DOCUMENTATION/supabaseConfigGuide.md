# Supabase Configuration Guide — Magic Link + Favorites

Step-by-step manual configuration for Supabase passwordless auth (magic link) and a `favorites` table with Row Level Security (RLS). This guide mirrors the step-by-step style in the Strapi guide so you can perform the setup manually in the Supabase Console.

---

## 📋 Overview

- Goal: Add passwordless login via magic link and a `favorites` feature where users can save recipes.
- Outcome: Users sign in via email, a profile page exists, and authenticated users can add/list/remove favorites using RLS-protected table.

---

## ✅ Prerequisites

- Supabase account with project access: https://app.supabase.com
- Local dev environment (Node.js + npm) to run the frontend and tests
- Editor access to update `.env` files (do not commit secrets)

---

## 1) Create a Supabase project (manual)

1. Go to https://app.supabase.com and sign in.
2. Click **New project** and enter a project name (e.g., `recipe-app`).
3. Choose a password for the DB and a region, then click **Create project**.
4. Wait for provisioning to finish.

Manual checks:

- Console → Project Settings → Data API shows a **Project URL** (copy this)
- Console → Project Settings → API → API Keys shows a **Publishable key** (anon) — copy this

> Add these to your local `.env` later as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (do not commit them).

---

## 2) Configure Authentication (Magic Link) — manual steps

1. Console → **Authentication** → **Settings**
   - Turn **Enable email sign-ups** ON
   - If you want, turn **Enable email confirmations** OFF for immediate magic link sign-in
   - Add Redirect URLs (Authentication → Settings → Redirect URLs):
     - `http://localhost:5173` (development)
     - `https://your-production-domain` (production)
   - Click **Save**
2. Console → **Authentication** → **Templates**
   - Optionally edit the magic link email subject/body and add Romanian copy or branding
3. Console → **Authentication** → **Email**
   - (Optional) Configure SMTP settings (Mailgun/SendGrid/Gmail App Password). If left blank, Supabase sends email via its provider.
4. Quick test (manual): from a dev console run `await supabase.auth.signInWithOtp({ email: 'you@example.com' })` and confirm you receive a magic link email

---

## 3) Create `favorites` table & RLS policies (SQL) — manual SQL

Open **SQL Editor** in Supabase Console and run the SQL below to create table and policies.

```sql
create extension if not exists pgcrypto;

create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade,
  recipe_slug text not null,
  created_at timestamptz default now()
);

alter table public.favorites enable row level security;

create policy "Select own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Insert own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Delete own favorites" on public.favorites
  for delete using (auth.uid() = user_id);
```

Manual checks:

- Console → Table Editor → public → favorites: verify columns and types
- Console → Policies for `public.favorites`: verify the three policies exist and are enabled

---

## 4) API keys & environment variables (manual)

1. Where to find keys in Console
   - **Publishable (anon) key** — Project Settings → API → API Keys → _Publishable key_ (use as `VITE_SUPABASE_ANON_KEY`)
   - **Project URL** — Project Settings → Data API → _Project URL_ (use as `VITE_SUPABASE_URL`)
   - **Service role key** (secret) — Project Settings → API → API Keys → _Service role key_ (store securely, do NOT commit)
2. Add to local `.env` (create if missing):

```
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

3. Add placeholders to `.env.example` (commit safe):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

4. Store `SUPABASE_SERVICE_ROLE_KEY` in CI secrets or server environment for test helpers (never in repo)

---

## 5) Client setup & manual testing (React)

1. Install client library: `npm i @supabase/supabase-js`
2. Add `src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

3. Implement Sign-in page (UI):
   - Minimal form with `email` and optional `name`
   - On submit call: `await supabase.auth.signInWithOtp({ email })`
   - Show success message: "Check your email for the login link" (localize to Romanian)
4. Listen to auth state changes in app root:

```ts
supabase.auth.onAuthStateChange((event, session) => {
  // set user in app state, redirect to /profile if logged in
});
```

5. Implement Profile page (`/profile`):
   - Show `user.email` and `user.user_metadata.name`
   - Add `Logout` button: `await supabase.auth.signOut()`
6. Implement Favorites UI & behavior:
   - Heart button on `RecipeCard` toggles favorite:
     - Add: `await supabase.from('favorites').insert({ user_id: user.id, recipe_slug })`
     - Remove: `await supabase.from('favorites').delete().match({ user_id: user.id, recipe_slug })`
   - List favorites: `await supabase.from('favorites').select('*').eq('user_id', user.id)`

Manual verify steps:

- Send magic link to your email and open it — confirm you see the logged-in state
- Toggle favorite and refresh — confirm persistence

---

## 6) Playwright testing — test helpers & approaches

Option A (recommended): Test-only helper endpoint (fast & reliable)

1. Create a small server endpoint available only under `NODE_ENV=test` (e.g., `/api/test-auth`) that:
   - Uses `SUPABASE_SERVICE_ROLE_KEY` to upsert or create a test user
   - Creates a session for the user (returns a cookie or token)
   - Returns the cookie/token to the test runner
2. In Playwright `beforeEach`, call this endpoint, set the cookie in the browser, then visit the protected page
3. Secure the endpoint with a test-only secret and disable in production

Option B: Mail capture

- Configure test SMTP (MailHog / Mailtrap) and read the magic link from the inbox during tests, then navigate to the link in Playwright

Note: Keep test-only utilities out of production code and behind environment guards

---

## 7) Add to repo & CI (manual checklist)

1. Add placeholders for env vars to `.env.example`
2. Add `SUPABASE_SERVICE_ROLE_KEY` to GitHub Actions secrets if you implement a test helper endpoint
3. CI job example (high-level):
   - Run `npm ci`
   - Start dev server (`npm run dev`)
   - Call test helper to create session or use MailHog
   - Run Playwright tests (`npx playwright test`)

---

## 8) Troubleshooting (common issues & fixes)

Issue: "Magic link email not sent"

- Check Console → Authentication → Logs to see send attempts
- If using custom SMTP, verify SMTP credentials and provider limits

Issue: "403 / unauthorized when querying favorites"

- Make sure client uses `VITE_SUPABASE_ANON_KEY` and the request includes Authorization header generated by Supabase client
- Confirm RLS policies are present and that `auth.uid()` returns the logged-in user's id

Issue: "Project URL or publishable key missing"

- Project URL: Console → Project Settings → Data API
- Publishable key: Console → Project Settings → API → API Keys

---

## 9) Quick manual checklist

- [ ] Supabase project created
- [ ] Redirect URLs set for dev & prod
- [ ] Magic link email template edited (optional, Romanian)
- [ ] `favorites` table created & RLS policies applied
- [ ] `.env` updated locally with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Sign-in + profile + favorite flows working locally
- [ ] Playwright tests authenticated via test helper or email capture

---

If you'd like, I can: 1) create a feature branch and scaffold the Supabase PoC (sign-in + profile + favorites with Playwright tests); or 2) scaffold the test-only helper endpoint that uses the Service Role key. Which should I do next?
