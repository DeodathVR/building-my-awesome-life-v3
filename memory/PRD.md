# Awesome Life Habits - Product Requirements Document

## Original Problem Statement
Create a minimalist web app called 'Awesome Life Habits' for tracking and building good habits, with integrated mindfulness tools to enhance focus. Features AI coaching using Gemini, voice commands, and focus exercises.

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (Gemini AI)
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts
- **Voice**: Web Speech API with browser fallback
- **AI**: Gemini 2.0 Flash via Emergent LLM Key

## User Personas
1. **Self-Improvers**: Building daily routines, tracking progress
2. **Mindfulness Seekers**: Focus exercises, stress reduction
3. **Busy Professionals**: Quick voice logging, mobile-friendly

## Core Requirements (Static)
- [x] Habit CRUD with streaks and progress tracking
- [x] Voice command center (hands-free habit logging)
- [x] Focus practices (3 exercises)
- [x] AI Coach with Gemini integration
- [x] Community posts and challenges
- [x] Education content
- [x] Dark mode toggle
- [x] Mobile responsive design

## Changelog — Feb 2026
- **Feb 2026**: Renamed "Hub" → "Home" throughout UI & routing
  - `HubPage.jsx` → `HomePage.jsx` (component/default export renamed)
  - `Navigation.jsx` label "Hub" → "Home"
  - `App.js` import updated
  - All references in `PricingPage.jsx`, `HowToUsePage.jsx`, `ConcentrationGamesPage.jsx` updated
  - Removed orphaned old `HomePage.jsx` (habits-centric, unreferenced)
- **Feb 10, 2026**: **Mandala watermark added to Home Dashboard** — user-provided starry-night mandala image saved to `/app/frontend/src/assets/mandala-watermark.png` and rendered as a fixed, subtle watermark on the Home Dashboard. Final configuration: **Centered Halo variant** (centered, `min(1100px, 95vh)` wide) at **50% opacity** with slow 60s rotation, dark-mode saturation boost, `prefers-reduced-motion` respect. Extensive UX iteration: shipped a live variant switcher (Centered Halo / Tiled / Full-Bleed / Twin Anchors / Original / Off) then swapped to a live opacity slider — user selected Centered Halo @ 50%. Preview UI removed after selection.
- **Feb 10, 2026**: **Lemon Squeezy application copy provided** — professional short/medium/long descriptions, refund policy, and category positioning delivered to user to speed up merchant approval (Trinidad & Tobago → LS is Merchant of Record; Stripe unavailable in region).
- **Feb 10, 2026**: **Legal Pages + Cookie Consent (LS-compliance)** — new `/privacy` (`PrivacyPolicyPage.jsx`) and `/terms` (`TermsOfServicePage.jsx`) public routes with comprehensive GDPR-lite policy covering Firebase/Firestore/PostHog/Emergent-LLM sub-processors, 14-day refund policy matching LS merchant application, and TT governing law. New `LegalFooter` component (Privacy · Terms · Contact · MoR disclosure) rendered in both AuthedLayout and PublicLayout. New `CookieConsent` banner (`Accept all` / `Essential only`) with localStorage persistence at `alu_cookie_consent_v1`; wired to `posthog.opt_in_capturing()` / `opt_out_capturing()`. AuthPage "Terms &amp; Privacy" text now links to the new pages. Verified: CI build passes (330 kB gzipped), Privacy page renders live, banner shows on first visit.
- **Feb 2026**: Full 15-game Concentration Games with dark neon gaming UI (`/app/frontend/src/pages/games-page.css`) — 5 challenges × 3 games each (Memory Recall, Speed Focus, Deep Work Sprint, Single Tab Rule, Micro Workout). 5 games free, 10 gated behind Pro.
- **Apr 24, 2026**: Wired interactive AI Coach sidebar on Concentration Games page — replaced readOnly input + `/coach` redirect with live Gemini 2.5 Flash chat via `xhrPost`. Shows tips by default, loading state, and response inline. Verified: CI build passes, live reply in ~2s.
- **Apr 24, 2026**: Migrated Awesome Feed + Education content from hardcoded arrays to Firestore collections. New `services/contentService.js` handles CRUD for `feed_posts` & `education_tips` + `feed_generation_log`. Auto-seeds 7 evergreen feed slides + 8 evergreen education tips on first load. Added **auto-daily AI generation** (Gemini 2.5 Flash → 7 fresh feed slides/day, triggered on first user visit per day, deduped via Firestore log). Admin panel gained **Feed** tab (CRUD + "✨ Generate 7 AI Posts" button) and **Education** tab (CRUD with habit/focus category + icon). Verified E2E: 7 evergreen → 14 posts after AI generation in ~9s.
- **Apr 24, 2026**: Admin "Generation History" panel — collapsible section in Feed tab shows last 30 days of auto-gen logs (date · status badge · post count · time · source · error). Includes one-click "🔄 Re-generate Today" (force=true) button. Verified live: re-gen added 7 new posts in 9s, history row refreshed with new timestamp.
- **Apr 24, 2026**: Engagement Analytics feedback loop — each `feed_posts` doc now tracks `likes/saves/shares` via atomic Firestore `increment()`. Feed page persists user actions (deduped per-user via localStorage). Admin Feed tab gained **Engagement Insights card**: top performing post in last 7d (score = likes×2 + saves×3 + shares) + avg score by type. Gemini daily-gen prompt now receives `winningTypes` hint so tomorrow's batch leans toward what resonates. Engagement counts also show inline on each post row; history log records which winning types biased each generation. Verified live: liked 2 posts → cosmic type score 5.0 → top card and per-row badges render correctly.
- **Apr 24, 2026**: **Firebase Auth integration** (P0.1) — added email/password + Google sign-in via `AuthContext` + `AuthPage`. Forced-login: all routes except `/auth` require authentication. `AdminRoute` restricts `/admin` to a single hardcoded email (`sparksofmotivation1001@gmail.com`). Navigation shows user avatar + sign-out menu. Admin link is conditional on admin status. AppContext now scopes `habits` by `userId`. Seed data per-user; auto-cleanup of legacy pre-auth habits runs once on first admin login. Admin page password gate removed (relies on route guard). Verified live: `/` redirects to `/auth`, `/admin` blocked without auth, signup UI works. **Requires Firebase Console setup**: enable Email/Password + Google providers + add Vercel domain to authorized domains.
- **Apr 24, 2026**: **Hybrid visibility** — `/pricing`, `/education`, `/how-to-use` now publicly accessible to logged-out visitors (for SEO + conversion). All other routes still require login. Nav shows "Sign in" button for logged-out users. Verified live.
- **Apr 27, 2026**: Fixed Firebase Auth — the project's API key in .env was outdated. Updated to fresh key from Firebase web app v2 config. Verified email/password + Google sign-in both working in production.
- **Apr 27, 2026**: **Firestore Security Rules** (P0.2) — comprehensive `rules_version='2'` ruleset at `/app/firestore.rules`. Key features: per-user `habits` scoping, admin-only writes for global content (`feed_posts`, `education_tips`, `challenges`), engagement-only updates allowed for non-admins on `feed_posts`/`community_posts` (likes/saves/shares via `diff().affectedKeys().hasOnly(...)`), public read on `education_tips` for SEO, default-deny on undeclared collections. Deployment guide at `/app/FIRESTORE_RULES_DEPLOYMENT.md`. **Requires user to publish rules in Firebase Console** (rules don't auto-deploy from filesystem). DEPLOYED Apr 28.
- **Apr 28, 2026**: **Backend AI Proxy** (P0.3) — moved all 4 Gemini call sites (AI Coach, Cosmic Reframer/Thought Tracker via AppContext, Games Coach, Daily Feed Gen) from frontend to FastAPI backend. New endpoints: `POST /api/ai/chat` (generic chat with system_prompt + history), `POST /api/ai/generate-feed` (admin-only batch). In-memory rate limiter: 100 req/hour per IP (returns 429 with Retry-After). Removed `REACT_APP_GEMINI_API_KEY` from frontend env entirely — Gemini key now only lives in backend `.env` (`GEMINI_API_KEY`). Verified live: Games AI Coach returns real Gemini response in 2s with no console errors. **Action needed: Deploy backend to Render** for Vercel production to work — guide at `/app/RENDER_DEPLOYMENT_GUIDE.md`.
- **Jul 01, 2026**: **Emergent LLM Key + Multi-Layer Abuse Protection**. Pivoted away from direct Google Gemini API (project got suspended). Backend `/api/ai/chat` and `/api/ai/generate-feed` now use `LlmChat` from `emergentintegrations` with `gemini-2.5-flash` — no more Google key management. **New rate limits** (all in-memory, resets on Render restart which is fine as safety fallback): per-user 20 chats/day + 3 feed-gens/day; per-IP fallback 30/day for unauthed; global daily cap 2000; global monthly cap 40000. Rate limit returns friendly upgrade-to-Pro CTA on 429. Frontend sends `X-User-Id` header on all AI calls. New endpoints: `GET /api/health` (UptimeRobot-friendly), `GET /api/ai/usage` (returns user + global counters for UI display). Legacy `/api/ai-coach` endpoint kept for compat, now uses Emergent LLM (no Google fallback). Removed all `httpx` direct-Gemini code. Verified live: per-user cap enforced at exactly 20/day with friendly 429 message.


## What's Been Implemented (January 15, 2025)
### Backend (16 API endpoints)
- `/api/habits` - Full CRUD + bulk logging
- `/api/habits/log` - Completion tracking with streak calculation
- `/api/chat` - Gemini-powered AI Coach
- `/api/community` - Posts CRUD with likes
- `/api/challenges` - Preset challenges
- `/api/stats` - Weekly progress data
- `/api/seed` - Sample data seeding

### Frontend (6 Pages)
1. **Home/Dashboard**: Hero, stats cards, habits list, weekly chart
2. **Habits Page**: Sortable list, search, calendar heatmap, bulk log
3. **Focus Page**: Flower observation, expanding circle, breath counter
4. **Education Page**: Atomic Habits tips, focus explanations
5. **Community Page**: Anonymous posts, challenges, quotes
6. **AI Coach Page**: Chat interface with suggested questions

### Key Components
- Voice Command Center (floating mic button)
- Add/Edit Habit Modal
- HabitCard with checkboxes, streaks, progress bars
- Navigation (desktop + mobile bottom nav)

## Prioritized Backlog
### P0 (Done)
- All core features implemented and tested

### P1 (Future Enhancements)
- Challenge progress tracking
- Habit reminders/notifications
- Export habit data
- Social sharing

### P2 (Nice to Have)
- Habit templates library
- Custom focus exercise creation
- Gamification (achievements, badges)
- Weekly/monthly reports

## Next Tasks
1. Add challenge enrollment and progress tracking
2. Implement habit reminder notifications
3. Add more voice command patterns
4. Create habit templates for common routines

## Updates - January 15, 2025 (v1.1)

### Focus Practices Enhanced
- **Lotus Observation**: Now uses royalty-free lotus bloom video from Pixabay (serene pond, pink lotus)
- **Breathing Animation**: Fixed sync - Inhale (4s) → Hold (3s) → Exhale (6s) with progress bars
- **Ambient Music**: Toggleable meditation music from Pixabay (looping)
- **Visual feedback**: Color changes during breath phases (teal → gold → teal)

### Education Page
- Added 3 educational video embeds (Atomic Habits Summary, Science of Meditation, Morning Routine)
- Videos play inline with click-to-play functionality

### Voice Commands
- Added "BETA" badge to voice command button
- Added beta disclaimer in help dialog explaining browser limitations
- Noted Chrome/Edge optimization

### Bug Fixes
- Verified habit updates saving correctly to MongoDB
- Streak calculations working properly

## Updates - February 10, 2025 (v1.2)

### UI Customization
- **Removed "Made with Emergent" watermark** from the application footer
- Updated page title to "Awesome Life Habits" 
- Updated meta description for SEO

### Focus Page Replaced with Focus Bloom Exercises
- **Replaced entire Focus page** with new concentration exercises from Focus Bloom app
- **4 Interactive Exercises:**
  1. **Flower Observation** - SVG flower with pointed petals, 4 color palettes (Sunrise, Ocean, Blossom, Lavender)
  2. **Circle Concentration** - Calming circle with gentle glow (renamed from Expanding Circle)
  3. **Candle Flame Flicker** - Realistic flickering flame with slower, gentler movement
  4. **Breath Counter** - 4-phase breathing with smooth fade transitions between phases
- **Exercise Player Features:**
  - Full-screen immersive experience
  - Timer with countdown (1-10 minute duration slider)
  - Play/Pause/Reset controls
  - Auto-hiding controls after 3 seconds
  - Color palette selector for Flower Observation
  - Back button navigation
- **New Routes:** `/focus` (exercise list), `/exercise/:exerciseId` (player)

## Updates - March 2025 (v1.3)

### Firebase Migration
- **Replaced Emergent backend** with Firebase Firestore for data persistence
- **Direct Gemini API calls** for AI Coach (no backend proxy needed)
- **New files created:**
  - `/app/frontend/src/firebase.js` - Firebase configuration
  - Updated `/app/frontend/src/context/AppContext.js` - Firebase Firestore integration
- **Environment variables updated** in `.env`:
  - Removed `REACT_APP_BACKEND_URL`
  - Added Firebase config keys (API key, project ID, etc.)
  - Added `REACT_APP_GEMINI_API_KEY` for direct AI calls
- **Collections in Firestore:**
  - `habits` - User habits with completions tracking
  - `community_posts` - Community feed posts
  - `challenges` - Preset challenges
- Auto-seeds initial data if collections are empty

### Home Page Theme Customization
- Added 3 selectable hero background themes:
  1. **Misty Mountains** (original) - Cool, serene forest landscape
  2. **Growth & Bloom** - Fluid, iridescent design with teal ribbons, golden/lavender bubbles, and sparkles
  3. **Sunny Optimism** - Bright yellow/orange with sun rays
- Theme selector accessible via palette icon in hero section (top right)
- Theme preference persists via localStorage

### Weekly Progress Redesign
- Replaced bar chart with **calendar heatmap grid** (4 weeks x 7 days)
- Teal color gradient showing completion intensity
- Day labels (Thu-Wed) at bottom
- Hover effects on each cell

### Pending Tasks
- None - Focus page is complete

### Upcoming Tasks (P2)
- Improve Voice Command reliability
- Implement browser notification reminders  
- Flesh out Community Challenges UI

### Future/Backlog
- Refactor SuccessConspiracyPage.jsx into smaller components
- Dark mode implementation
- Additional focus exercises

## Updates - April 2025 (v1.5) — 6 New Pages

### New Pages Added
- **Hub Dashboard** (`/`) — Replaces HomePage. Stats, 14-day activity heatmap, motivational quote, App Map of all 13 pages
- **Concentration Games** (`/concentration-games`) — 3 challenge types, 5 mini-games (Number Flash, Math Sprint, Box Breathing, One Focus, 10 Rep), XP system with levels
- **Glow Up** (`/glow-up`) — AI photo transformation wizard (upload → goals → style → generate). Calls backend `/api/glow-up/generate` with Gemini image generation. Free users get 1 transformation, Pro users get unlimited
- **How To Use** (`/how-to-use`) — Interactive onboarding guide with getting-started checklist, feature tabs, pro tips, Free vs Pro comparison, FAQ
- **Pricing** (`/pricing`) — 3-tier pricing (Free / Pro $9.99 / Family $19.99) with monthly/annual toggle, comparison table, testimonials, FAQ
- **Admin Panel** (`/admin`) — Password-protected (password: `awesome2026`) content manager for articles and custom games using localStorage

### Navigation Updated
- All 13 pages now appear in the compact desktop navigation bar
- Mobile navigation updated with grid dropdown and new bottom nav items

### Backend Updated
- Added `/api/glow-up/generate` POST endpoint using Gemini `gemini-2.0-flash-preview-image-generation` via emergentintegrations
- Added `ImageContent` import from emergentintegrations

### Known Limitations
- Admin password is client-side only (in JS bundle) — fine for single-user app
- Admin "Change Password" form is session-only (not persisted)
- Glow Up requires internet + valid EMERGENT_LLM_KEY for image generation

### Next Action Items (P1)
- Migrate Awesome Feed videos from hardcoded React arrays to Firestore `feed_content` collection
- Migrate Education content from hardcoded arrays to Firestore `educational_content` collection

### Upcoming Tasks (P2)
- Improve Voice Command reliability
- Implement browser notification reminders
- Flesh out Community Challenges UI
