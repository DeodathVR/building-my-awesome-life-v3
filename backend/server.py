from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from collections import defaultdict
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (optional — app works without it; only glow_up history persistence needs it)
mongo_url = os.environ.get('MONGO_URL', '').strip()
db_name = os.environ.get('DB_NAME', 'awesome_life').strip() or 'awesome_life'
if mongo_url:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
else:
    client = None
    db = None
    logging.warning("MONGO_URL not set — running without MongoDB. Glow Up history persistence will be disabled.")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class Habit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    frequency: str = "daily"  # daily, weekly
    streak: int = 0
    total_completions: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_completed: Optional[str] = None
    completions: List[str] = []  # List of ISO date strings

class HabitCreate(BaseModel):
    name: str
    description: str = ""
    frequency: str = "daily"

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None

class HabitLog(BaseModel):
    habit_id: str
    completed: bool = True
    date: Optional[str] = None  # ISO date string, defaults to today

class CommunityPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    likes: int = 0

class CommunityPostCreate(BaseModel):
    content: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class GlowUpRequest(BaseModel):
    image_base64: str
    prompt: str
    goals: str = ""

# ==================== Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Awesome Life Habits API"}

# ----- Habits -----

@api_router.get("/habits", response_model=List[Habit])
async def get_habits():
    habits = await db.habits.find({}, {"_id": 0}).to_list(1000)
    return habits

@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_input: HabitCreate):
    habit = Habit(**habit_input.model_dump())
    doc = habit.model_dump()
    await db.habits.insert_one(doc)
    return habit

@api_router.put("/habits/{habit_id}", response_model=Habit)
async def update_habit(habit_id: str, habit_input: HabitUpdate):
    update_data = {k: v for k, v in habit_input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.habits.find_one_and_update(
        {"id": habit_id},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Habit not found")
    return Habit(**result)

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    result = await db.habits.delete_one({"id": habit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted"}

@api_router.post("/habits/log", response_model=Habit)
async def log_habit(log_input: HabitLog):
    habit = await db.habits.find_one({"id": log_input.habit_id}, {"_id": 0})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    target_date = log_input.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    completions = habit.get("completions", [])
    
    if log_input.completed:
        if target_date not in completions:
            completions.append(target_date)
            completions.sort()
            
            # Calculate streak
            streak = calculate_streak(completions)
            
            # Find the most recent completion for last_completed
            last_completed = completions[-1] if completions else None
            
            await db.habits.update_one(
                {"id": log_input.habit_id},
                {
                    "$set": {
                        "completions": completions,
                        "last_completed": last_completed,
                        "streak": streak,
                        "total_completions": len(completions)
                    }
                }
            )
    else:
        if target_date in completions:
            completions.remove(target_date)
            completions.sort()
            streak = calculate_streak(completions)
            
            # Find the most recent completion for last_completed
            last_completed = completions[-1] if completions else None
            
            await db.habits.update_one(
                {"id": log_input.habit_id},
                {
                    "$set": {
                        "completions": completions,
                        "last_completed": last_completed,
                        "streak": streak,
                        "total_completions": len(completions)
                    }
                }
            )
    
    updated = await db.habits.find_one({"id": log_input.habit_id}, {"_id": 0})
    return Habit(**updated)

def calculate_streak(completions: List[str]) -> int:
    if not completions:
        return 0
    
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    streak = 0
    current_date = today
    
    sorted_completions = sorted([datetime.fromisoformat(c).date() for c in completions], reverse=True)
    
    for comp_date in sorted_completions:
        if comp_date == current_date or comp_date == current_date - timedelta(days=1):
            streak += 1
            current_date = comp_date - timedelta(days=1)
        else:
            break
    
    return streak

@api_router.post("/habits/bulk-log")
async def bulk_log_habits(habit_ids: List[str]):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    results = []
    
    for habit_id in habit_ids:
        try:
            result = await log_habit(HabitLog(habit_id=habit_id, date=today))
            results.append(result)
        except HTTPException:
            continue
    
    return results

# ----- Community -----

@api_router.get("/community", response_model=List[CommunityPost])
async def get_community_posts():
    posts = await db.community_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.post("/community", response_model=CommunityPost)
async def create_community_post(post_input: CommunityPostCreate):
    post = CommunityPost(**post_input.model_dump())
    doc = post.model_dump()
    await db.community_posts.insert_one(doc)
    return post

@api_router.post("/community/{post_id}/like")
async def like_post(post_id: str):
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$inc": {"likes": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post liked"}

# ----- Challenges -----

PRESET_CHALLENGES = [
    {
        "id": "30-day-meditation",
        "title": "30-Day Meditation Challenge",
        "description": "Practice mindfulness with daily flower observation sessions for 30 days.",
        "duration": 30,
        "type": "focus"
    },
    {
        "id": "7-day-habit-starter",
        "title": "7-Day Habit Starter",
        "description": "Voice-log one new habit every day for a week to build your routine.",
        "duration": 7,
        "type": "habit"
    },
    {
        "id": "focus-week",
        "title": "Focus Week",
        "description": "Combine all focus practices - flower observation, expanding circle, and breath counting.",
        "duration": 7,
        "type": "focus"
    },
    {
        "id": "morning-routine",
        "title": "21-Day Morning Routine",
        "description": "Build a solid morning routine with meditation, exercise, and journaling.",
        "duration": 21,
        "type": "habit"
    }
]

@api_router.get("/challenges")
async def get_challenges():
    return PRESET_CHALLENGES


# ----- Health check (for UptimeRobot / Render probe) -----
@api_router.get("/health")
async def health():
    """Lightweight health endpoint — 200 while the server is running.
    Detailed usage counters were removed (SEC-hardening: prior version leaked
    business signals to unauthenticated callers)."""
    return {"status": "ok"}

# ----- AI Proxy (Emergent LLM Key with multi-layer abuse protection) -----

# Abuse-protection quotas (buckets: today's date UTC as YYYY-MM-DD)
_CHAT_PER_USER_DAILY = 20        # AI chats per authenticated user per day
_FEED_PER_USER_DAILY = 3         # feed generations per user per day
_CHAT_PER_IP_DAILY = 30          # unauthed / fallback IP-based cap
_GLOBAL_CALLS_DAILY = 2000       # hard ceiling across all users/day
_GLOBAL_CALLS_MONTHLY = 40000    # secondary ceiling / month

# In-memory usage counters — resets on Render restart which is fine as a safety fallback
# Structure: { "bucket_key" -> int_count }
_usage_counters: Dict[str, int] = defaultdict(int)

def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def _this_month_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def _user_id(request: Request) -> Optional[str]:
    """Extract Firebase UID from X-User-Id header. Pragmatic MVP approach —
    frontend passes user.uid from Firebase Auth. Not cryptographically verified
    but bypass only lets an attacker rotate identities (which they could also
    do by creating new Firebase accounts). IP-based and global caps are the
    hard defenses."""
    uid = request.headers.get("x-user-id", "").strip()
    return uid if uid else None

def _consume_quota(request: Request, kind: str) -> Dict[str, int]:
    """Consume 1 quota unit for this request. Raises 429 if any limit hit.
    Returns dict with remaining counts for observability.
    kind: 'chat' or 'feed'"""
    today = _today_utc()
    month = _this_month_utc()

    # Layer 1: Global monthly cap (hardest ceiling)
    g_month = _usage_counters[f"global:month:{month}"]
    if g_month >= _GLOBAL_CALLS_MONTHLY:
        raise HTTPException(
            status_code=429,
            detail="Monthly AI quota reached across all users. Please try again next month.",
            headers={"Retry-After": "86400"},
        )

    # Layer 2: Global daily cap
    g_day = _usage_counters[f"global:day:{today}"]
    if g_day >= _GLOBAL_CALLS_DAILY:
        raise HTTPException(
            status_code=429,
            detail="Daily AI quota reached across all users. Please try again tomorrow.",
            headers={"Retry-After": "3600"},
        )

    # Layer 3: Per-user daily cap (if authed)
    uid = _user_id(request)
    if uid:
        per_user_cap = _CHAT_PER_USER_DAILY if kind == "chat" else _FEED_PER_USER_DAILY
        u_day = _usage_counters[f"user:{uid}:{kind}:{today}"]
        if u_day >= per_user_cap:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"You've hit today's AI limit ({per_user_cap} {kind} requests). "
                    f"Upgrade to Pro for unlimited access, or come back tomorrow!"
                ),
                headers={"Retry-After": "3600", "X-Quota-Reset": "midnight-utc"},
            )
    else:
        # Layer 4: Per-IP daily cap (fallback when unauthed)
        ip = _client_ip(request)
        ip_day = _usage_counters[f"ip:{ip}:{kind}:{today}"]
        if ip_day >= _CHAT_PER_IP_DAILY:
            raise HTTPException(
                status_code=429,
                detail="Daily anonymous limit reached. Please sign in to continue.",
                headers={"Retry-After": "3600"},
            )

    # Commit — increment all applicable counters atomically
    _usage_counters[f"global:day:{today}"] += 1
    _usage_counters[f"global:month:{month}"] += 1
    if uid:
        _usage_counters[f"user:{uid}:{kind}:{today}"] += 1
    else:
        ip = _client_ip(request)
        _usage_counters[f"ip:{ip}:{kind}:{today}"] += 1

    return {
        "global_day_used": _usage_counters[f"global:day:{today}"],
        "global_day_cap": _GLOBAL_CALLS_DAILY,
    }


async def _emergent_chat(system_message: str, user_text: str, temperature: float = 0.7,
                          max_tokens: int = 1024, session_id: Optional[str] = None,
                          json_mode: bool = False) -> str:
    """Send a one-shot chat via Emergent LLM (gemini-2.5-flash) and return the text response."""
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    sid = session_id or str(uuid.uuid4())
    if json_mode:
        # Nudge the model to reply strictly in JSON
        system_message = system_message + "\n\nRespond with valid JSON only. No markdown, no prose outside JSON."

    chat = (
        LlmChat(
            api_key=emergent_key,
            session_id=sid,
            system_message=system_message,
        )
        .with_model("gemini", "gemini-2.5-flash")
        .with_params(temperature=temperature, max_tokens=max_tokens)
    )
    reply = await chat.send_message(UserMessage(text=user_text))
    return str(reply) if reply is not None else ""


@api_router.get("/ai/usage")
async def ai_usage(request: Request):
    """Returns current user + global quota consumption. Frontend can poll to show
    the user their remaining chats today."""
    today = _today_utc()
    month = _this_month_utc()
    uid = _user_id(request)
    usage = {
        "global_day_used": _usage_counters[f"global:day:{today}"],
        "global_day_cap": _GLOBAL_CALLS_DAILY,
        "global_month_used": _usage_counters[f"global:month:{month}"],
        "global_month_cap": _GLOBAL_CALLS_MONTHLY,
    }
    if uid:
        usage["user_chat_used"] = _usage_counters[f"user:{uid}:chat:{today}"]
        usage["user_chat_cap"] = _CHAT_PER_USER_DAILY
        usage["user_feed_used"] = _usage_counters[f"user:{uid}:feed:{today}"]
        usage["user_feed_cap"] = _FEED_PER_USER_DAILY
    return usage


class AIChatRequest(BaseModel):
    """Generic chat request used by AI Coach, Cosmic Reframer, Thought Tracker, Games Coach.
    Input sizes are hard-capped server-side (SEC-002 mitigation)."""
    message: str = Field(..., min_length=1, max_length=2000)
    system_prompt: Optional[str] = Field(None, max_length=1200)
    history: Optional[List[Dict[str, str]]] = None  # kept for API compat, not used
    temperature: float = Field(0.7, ge=0.0, le=1.5)
    max_output_tokens: int = Field(1024, ge=32, le=2048)


@api_router.post("/ai/chat")
async def ai_chat(payload: AIChatRequest, request: Request):
    _consume_quota(request, kind="chat")
    system_msg = payload.system_prompt or "You are a helpful, warm, encouraging assistant."
    try:
        text = await _emergent_chat(
            system_message=system_msg,
            user_text=payload.message,
            temperature=payload.temperature,
            max_tokens=payload.max_output_tokens,
        )
        return {"response": text}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat failed. Please try again.")


class FeedGenerateRequest(BaseModel):
    winning_types: Optional[List[str]] = None  # bias hint from engagement analytics


@api_router.post("/ai/generate-feed")
async def ai_generate_feed(payload: FeedGenerateRequest, request: Request):
    _consume_quota(request, kind="feed")

    hint = ""
    if payload.winning_types:
        hint = (
            f"\nENGAGEMENT SIGNAL: Over the past week, users are engaging most with these types: "
            f"{', '.join(payload.winning_types)}. Include at least 2-3 slides of these winning "
            f"types in your 7, while still keeping variety across all 5 types."
        )

    system_msg = (
        "You are writing short, uplifting micro-content for a habit-tracking app called "
        "\"Awesome Life\". Voice: gentle, witty, affirming. NEVER repeat evergreen seeded content."
    )

    user_prompt = (
        "Generate exactly 7 NEW and UNIQUE feed slides for today as a JSON array. Each slide must "
        "be one of: conspiracy (whimsical reframe of setbacks), reframe (positive perspective flip), "
        "affirmation (mindful encouragement), quickwin (community-style win mention), cosmic "
        "(cosmic/universe themed motivation).\n\n"
        "Return ONLY a valid JSON array (no markdown, no prose) with exactly 7 objects, each with:\n"
        "- \"type\": one of \"conspiracy\" | \"reframe\" | \"affirmation\" | \"quickwin\" | \"cosmic\"\n"
        "- \"category\": matching label — \"Witty Conspiracy\" | \"Awesome Reframe\" | "
        "\"Bloom Moment\" | \"Quick Win Spotlight\" | \"Cosmic Teaser\"\n"
        "- \"visual\": one of \"lotus\" | \"daisy\" | \"circle\" | \"stats\" | \"cosmic\"\n"
        "- \"text\": main message, 1-2 sentences warm and poetic, can include one emoji max\n"
        "- \"subtext\": short tag line, 2-5 words\n\n"
        f"Mix the 5 types across 7 slides.{hint}"
    )

    try:
        raw = await _emergent_chat(
            system_message=system_msg,
            user_text=user_prompt,
            temperature=0.9,
            max_tokens=2048,
            json_mode=True,
        )
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        try:
            items = json.loads(cleaned)
        except json.JSONDecodeError:
            start, end = cleaned.find("["), cleaned.rfind("]")
            if start == -1 or end == -1:
                raise HTTPException(status_code=502, detail="AI returned unparseable JSON")
            items = json.loads(cleaned[start:end + 1])
        if not isinstance(items, list):
            raise HTTPException(status_code=502, detail="AI did not return a list")
        return {"posts": items}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"AI feed gen error: {e}")
        raise HTTPException(status_code=500, detail="AI feed generation failed. Please try again.")


# ----- Stats -----

@api_router.get("/stats")
async def get_stats():
    habits = await db.habits.find({}, {"_id": 0}).to_list(1000)
    
    total_habits = len(habits)
    total_completions = sum(h.get("total_completions", 0) for h in habits)
    total_streak = sum(h.get("streak", 0) for h in habits)
    max_streak = max((h.get("streak", 0) for h in habits), default=0)
    
    # Weekly completions
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    week_ago = today - timedelta(days=7)
    
    weekly_data = []
    for i in range(7):
        day = week_ago + timedelta(days=i+1)
        day_str = day.isoformat()
        count = sum(1 for h in habits if day_str in h.get("completions", []))
        weekly_data.append({
            "day": day.strftime("%a"),
            "completions": count
        })
    
    return {
        "total_habits": total_habits,
        "total_completions": total_completions,
        "total_streak": total_streak,
        "max_streak": max_streak,
        "weekly_data": weekly_data
    }

# ----- Seed Data -----

@api_router.post("/seed")
async def seed_data():
    # Check if data exists
    existing = await db.habits.count_documents({})
    if existing > 0:
        return {"message": "Data already exists"}
    
    sample_habits = [
        {"name": "Morning Meditation", "description": "5 minutes of mindful breathing", "frequency": "daily"},
        {"name": "Read 10 Pages", "description": "Read 10 pages of a book", "frequency": "daily"},
        {"name": "Evening Walk", "description": "30-minute walk in nature", "frequency": "daily"},
        {"name": "Gratitude Journal", "description": "Write 3 things I'm grateful for", "frequency": "daily"},
        {"name": "Drink 8 Glasses of Water", "description": "Stay hydrated throughout the day", "frequency": "daily"}
    ]
    
    for habit_data in sample_habits:
        habit = Habit(**habit_data)
        await db.habits.insert_one(habit.model_dump())
    
    sample_posts = [
        {"content": "Hit 7 days of focus practice! The flower observation exercise is amazing."},
        {"content": "Just started my morning meditation habit. Day 1 complete!"},
        {"content": "The expanding circle exercise really helps me focus before work."},
        {"content": "30 days of reading! Small habits really do add up."}
    ]
    
    for post_data in sample_posts:
        post = CommunityPost(**post_data)
        await db.community_posts.insert_one(post.model_dump())
    
    return {"message": "Sample data created"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    # Locked-down origins (SEC-hardening). Defaults cover Vercel prod + preview.
    allow_origins=[o.strip() for o in os.environ.get(
        'CORS_ORIGINS',
        'https://buildingmyawesomelifedaily.com,https://www.buildingmyawesomelifedaily.com'
    ).split(',') if o.strip()],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-User-Id"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
