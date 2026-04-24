# Test Credentials

## App Access (Firebase Auth)
- URL: /auth
- Auth providers: **Email/Password + Google sign-in**
- **Admin email (hardcoded):** `sparksofmotivation1001@gmail.com` — this account is the only one that sees the `/admin` route
- Firebase Auth providers must be enabled in Firebase Console before first use:
  - https://console.firebase.google.com/project/building-my-awesome-life/authentication/providers
  - Enable "Email/Password" and "Google" sign-in methods
- Authorized domains for Vercel: add your Vercel URL under Auth → Settings → Authorized domains
- Testing: create any test account via the sign-up form (email + password ≥ 6 chars)

## Pro Status (Testing)
- To simulate Pro user: set localStorage key 'alu_isPro' = 'true'
- To reset to Free: remove 'alu_isPro' from localStorage

## AI Features
- AI Coach, Cosmic Reframer, Thought Tracker, Games AI Coach, Daily Feed Gen: Uses REACT_APP_GEMINI_API_KEY (model: gemini-2.5-flash)
- Glow Up image generation: Uses EMERGENT_LLM_KEY in backend/.env (backend endpoint /api/glow-up/generate)

## Firestore Collections
- habits: per-user (filtered by userId)
- feed_posts: global (shared)
- education_tips: global (shared)
- feed_generation_log: global
- community_posts: global
- challenges: global

## Legacy cleanup
- On first login of the admin account, any pre-auth habits without a userId field are auto-deleted
- Tracked via localStorage key `alu_legacy_cleaned_v1`
