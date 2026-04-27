# Test Credentials

## App Access (Firebase Auth)
- URL: /auth
- Auth providers: **Email/Password + Google sign-in** (both verified working in production)
- **Admin email (hardcoded):** `sparksofmotivation1001@gmail.com` — only this account sees `/admin`
- For test signups: any email format works (e.g., `tester{n}@example.com` with password 6+ chars)
- Firebase API key (current/working): `AIzaSyBMOZyZIcgakUK9ul9Fq_F-CxkjUVz-oEE`
- Firebase project: `building-my-awesome-life` (web app v2: `1:255547195545:web:166b043de1bfc5e75b7808`)

## Pro Status (Testing)
- To simulate Pro user: set localStorage key 'alu_isPro' = 'true'
- To reset to Free: remove 'alu_isPro' from localStorage

## AI Features
- AI Coach, Cosmic Reframer, Thought Tracker, Games AI Coach, Daily Feed Gen: Uses REACT_APP_GEMINI_API_KEY (model: gemini-2.5-flash)
- Glow Up image generation: Uses EMERGENT_LLM_KEY in backend/.env (backend endpoint /api/glow-up/generate)

## Firestore Collections (with security rules in /app/firestore.rules)
- habits: per-user (filtered by userId) — owner read/write only, admin can delete legacy
- feed_posts: global read (auth required), admin CRUD; non-admins can only update likes/saves/shares
- education_tips: PUBLIC read (no auth — for SEO), admin write
- feed_generation_log: any auth read/write (will tighten in P0.3)
- community_posts: any auth read/create, admin update/delete
- challenges: any auth read, admin write
- Default deny on all other collections

## Legacy cleanup
- On first login of admin account, any pre-auth habits without a userId field are auto-deleted
- Tracked via localStorage key `alu_legacy_cleaned_v1`

## Deployment Notes
- Firestore rules MUST be manually published in Firebase Console — they don't auto-deploy from /app/firestore.rules
- See /app/FIRESTORE_RULES_DEPLOYMENT.md for step-by-step instructions
