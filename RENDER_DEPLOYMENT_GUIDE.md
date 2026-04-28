# Backend Deployment Guide — Render.com (Free Tier)

This guide walks you through deploying your FastAPI backend to Render so your Vercel frontend can call AI endpoints in production.

## Why this is needed
- Vercel only hosts your React frontend (static files)
- Your `/api/ai/chat`, `/api/ai/generate-feed`, and `/api/glow-up/generate` endpoints live in `backend/server.py` (FastAPI)
- Without a hosted backend, Pro features won't work in production: AI Coach, Cosmic Reframer, Thought Tracker, Daily Feed Gen, Games Coach, Glow Up

## Prerequisites
- GitHub account with your code pushed (you've already done this)
- Render.com account (free — sign up at https://render.com with your GitHub)
- ~10 minutes

## Step-by-step

### 1. Create a Render Web Service
1. Open https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect your GitHub account if first time
4. Find your repository and click **Connect**

### 2. Configure the service
Fill in the form exactly like this:

| Field | Value |
|-------|-------|
| **Name** | `awesome-life-backend` (or whatever you prefer) |
| **Region** | Choose closest to you (Oregon if US, Frankfurt if EU) |
| **Branch** | `main` (or whatever your default is) |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | **Free** (you can upgrade later) |

### 3. Add environment variables (click "Advanced")

Click **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `MONGO_URL` | (leave blank or add a free MongoDB Atlas URL — see "MongoDB" below) |
| `DB_NAME` | `awesome_life_prod` |
| `CORS_ORIGINS` | `*` (or restrict to your Vercel URL — see "CORS" below) |
| `EMERGENT_LLM_KEY` | `sk-emergent-25131FcF0A567783b9` (from /app/backend/.env) |
| `GEMINI_API_KEY` | `AIzaSyC81r3XZTN933EpAiZQitEhxZcXZSQRfVc` (from /app/backend/.env) |

### 4. Click "Create Web Service"
Render will start building. First deploy takes 3-5 minutes. Watch the live logs.

When you see `Application startup complete.` your service is live.

### 5. Get your backend URL
Render gives you a URL like `https://awesome-life-backend.onrender.com`. Copy it.

### 6. Update Vercel
1. Open Vercel dashboard → your frontend project → Settings → Environment Variables
2. Add (or update):
   - **Key**: `REACT_APP_BACKEND_URL`
   - **Value**: `https://awesome-life-backend.onrender.com` (your URL from step 5, no trailing slash)
   - **Apply to**: Production, Preview, Development (all checked)
3. Click **Save**
4. Go to Vercel → Deployments → click ⋯ on latest → **Redeploy** (so the new env var bakes into the build)

### 7. Verify it works
After redeploy completes:
1. Visit your Vercel URL → sign in
2. Go to `/coach` and send a message
3. You should get a real Gemini reply

### 8. (Optional but recommended) Restrict CORS
Once verified working, tighten CORS:
1. Render dashboard → your service → Environment → edit `CORS_ORIGINS`
2. Change `*` to a comma-separated list:
   ```
   https://your-app.vercel.app,https://your-custom-domain.com
   ```
3. Save → Render auto-redeploys

## Important Render Free Tier Notes

⚠️ **Free instances spin down after 15 min of inactivity.** First request after that takes ~30s to wake. Solutions:
- **Cheap fix**: Set up an UptimeRobot ping every 10 minutes (free) → keeps it awake
- **Real fix**: Upgrade to Render Starter ($7/mo) → always-on instance, no cold starts. Worth it once you have paying users.

## MongoDB

Your app currently uses MongoDB but ONLY for habit-related Glow Up image storage (which is the only backend feature persisting data). Most of your app uses Firebase Firestore — MongoDB is barely used.

**Options:**
- **Skip MongoDB entirely**: leave `MONGO_URL` blank. Some non-essential endpoints may fail but the AI proxy works fine.
- **Free MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register — create a free M0 cluster (512MB), get the connection string, paste into `MONGO_URL`. ~5 min setup.

For your MVP launch, you can ship with `MONGO_URL` blank and add Atlas later if/when you need it.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails on `pip install` | Check Render logs — usually a missing dep. May need to update `backend/requirements.txt`. |
| 502/503 errors after deploy | Service is still warming up. Wait 30s. |
| `CORS error` in browser console | Update `CORS_ORIGINS` to include your Vercel URL exactly (no trailing slash). |
| AI calls return 429 | Rate limit working as designed (100/hr/IP). Wait an hour. |
| AI calls return 500 with "AI service not configured" | `GEMINI_API_KEY` env var missing on Render. Re-check step 3. |
| Service keeps spinning down | Set up UptimeRobot or upgrade to Starter plan |

## Architecture summary after deployment

```
[User Browser]
      |
      v
[Vercel: React frontend]   ←── your custom domain or .vercel.app
      |
      | (calls REACT_APP_BACKEND_URL)
      v
[Render: FastAPI backend]   ←── awesome-life-backend.onrender.com
      |
      ├── /api/ai/chat            (Gemini text)
      ├── /api/ai/generate-feed   (Gemini batch)
      └── /api/glow-up/generate   (Emergent image)
              |
              v
   [Google Gemini API + Emergent LLM]
              |
              v
   [Firestore: per-user data]
```
