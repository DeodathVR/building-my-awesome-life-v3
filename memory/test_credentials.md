# Test Credentials

## Admin Panel
- URL: /admin
- Password: awesome2026
- Note: Client-side only password (stored in AdminPage.jsx as ADMIN_PASS constant)
- Session: Uses sessionStorage key 'alu_admin' = '1'

## App Access
- No user authentication required
- Firebase Firestore: open read/write (no auth rules currently)
- All habit data stored directly to Firestore without login

## Pro Status (Testing)
- To simulate Pro user: set localStorage key 'alu_isPro' = 'true'
- To reset to Free: remove 'alu_isPro' from localStorage

## AI Features
- AI Coach & Cosmic Reframer: Uses REACT_APP_GEMINI_API_KEY in frontend/.env
- Glow Up image generation: Uses EMERGENT_LLM_KEY in backend/.env (backend endpoint /api/glow-up/generate)
