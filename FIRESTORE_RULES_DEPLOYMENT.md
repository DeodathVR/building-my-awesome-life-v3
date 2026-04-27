# Firestore Security Rules — Deployment Guide

## What this does
Locks down your Firestore database so users can only access their own data, while letting the admin manage global content. Defense-in-depth on top of the auth-based UI gating.

## How to deploy (2 minutes, one-time)

### Option 1: Firebase Console (easiest, recommended)

1. Open: https://console.firebase.google.com/project/building-my-awesome-life/firestore/rules
2. You'll see a code editor with the current rules (probably "allow read, write: if true" or similar)
3. **Select all** existing rules → **Delete**
4. Open `/app/firestore.rules` in your repo
5. **Copy entire contents** → paste into the Firebase Console editor
6. Click **"Publish"** in the top-right corner
7. You should see a green "Rules published" toast

### Option 2: Firebase CLI (if you want version-controlled rules)

```bash
npm install -g firebase-tools
firebase login
firebase init firestore  # in repo root, choose existing project, accept rules file
firebase deploy --only firestore:rules
```

## What to test after deployment

Sign in with two different accounts and verify:

1. **Admin (`sparksofmotivation1001@gmail.com`)**:
   - ✅ Can see/create/edit/delete habits
   - ✅ Can see/CRUD feed posts in `/admin`
   - ✅ Can see/CRUD education tips in `/admin`
   - ✅ Can trigger AI feed generation
   - ✅ Can see Generation History panel

2. **Regular user** (any other email):
   - ✅ Can see/create/edit/delete OWN habits
   - ❌ Cannot see other users' habits (try opening a private incognito session)
   - ✅ Can read all feed posts + education tips
   - ✅ Can like/save/share feed posts (engagement counters increment)
   - ❌ Cannot edit feed post text/category (will get "Missing or insufficient permissions" error if attempted)
   - ❌ Cannot access `/admin` (route guard redirects)

## What collections are protected

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `habits` | own only | own only | own only | own + admin |
| `feed_posts` | any auth | admin | admin OR engagement-only | admin |
| `education_tips` | **public** | admin | admin | admin |
| `feed_generation_log` | any auth | any auth* | any auth* | any auth* |
| `community_posts` | any auth | any auth | admin OR engagement | admin |
| `challenges` | any auth | admin | admin | admin |
| anything else | DENY | DENY | DENY | DENY |

*`feed_generation_log` is temporarily writable by any user because the AI generation runs from the frontend. This will be tightened in P0.3 when Gemini moves to the FastAPI backend.

**Note:** `education_tips` is intentionally public-readable (no auth) so logged-out visitors can browse `/education` — this is your SEO/marketing surface.

## Rollback (if something breaks)

If users start reporting "permission denied" errors:
1. Go back to Firebase Console → Firestore → Rules
2. Click **"Rules history"** in top-right
3. Select the previous version and click **"Restore"**
4. Tell me the exact error message and which page triggered it
