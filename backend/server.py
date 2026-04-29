from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import time
from collections import defaultdict
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import httpx

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

# ----- AI Proxy (hides Gemini API key from frontend) -----

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

# Simple in-memory rate limiter: 100 requests/hour per IP
_RATE_LIMIT_MAX = 100
_RATE_LIMIT_WINDOW = 3600  # 1 hour
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)

def _client_ip(request: Request) -> str:
    # Honor common proxy headers (Render, Vercel, Cloudflare set these)
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def _check_rate_limit(ip: str):
    now = time.time()
    history = _rate_limit_store[ip]
    # Drop entries outside the window
    fresh = [t for t in history if now - t < _RATE_LIMIT_WINDOW]
    if len(fresh) >= _RATE_LIMIT_MAX:
        oldest = fresh[0]
        retry = int(_RATE_LIMIT_WINDOW - (now - oldest))
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded ({_RATE_LIMIT_MAX}/hour). Try again in {retry}s.",
            headers={"Retry-After": str(retry)},
        )
    fresh.append(now)
    _rate_limit_store[ip] = fresh

class AIChatRequest(BaseModel):
    """Generic chat request used by AI Coach, Cosmic Reframer, Thought Tracker, Games Coach"""
    message: str
    system_prompt: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None  # [{"role":"user"|"model","text":"..."}]
    temperature: float = 0.7
    max_output_tokens: int = 1024

@api_router.post("/ai/chat")
async def ai_chat(payload: AIChatRequest, request: Request):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    _check_rate_limit(_client_ip(request))

    # Build Gemini contents
    contents: List[Dict[str, Any]] = []
    if payload.system_prompt:
        # Gemini doesn't have a separate system role; prepend to first user turn
        first_user_text = f"{payload.system_prompt}\n\n{payload.message}"
    else:
        first_user_text = payload.message

    if payload.history:
        for turn in payload.history:
            role = "user" if turn.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": turn.get("text", "")}]})
        contents.append({"role": "user", "parts": [{"text": payload.message}]})
    else:
        contents.append({"role": "user", "parts": [{"text": first_user_text}]})

    try:
        async with httpx.AsyncClient(timeout=30) as client_http:
            resp = await client_http.post(
                f"{GEMINI_BASE_URL}?key={api_key}",
                json={
                    "contents": contents,
                    "generationConfig": {
                        "temperature": payload.temperature,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": payload.max_output_tokens,
                    },
                },
            )
        data = resp.json()
        if resp.status_code != 200 or data.get("error"):
            msg = data.get("error", {}).get("message", f"Gemini error {resp.status_code}")
            logging.error(f"AI chat upstream error: {msg}")
            raise HTTPException(status_code=502, detail=msg)
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return {"response": text}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail=f"AI chat failed: {e}")


class FeedGenerateRequest(BaseModel):
    winning_types: Optional[List[str]] = None  # bias hint from engagement analytics

@api_router.post("/ai/generate-feed")
async def ai_generate_feed(payload: FeedGenerateRequest, request: Request):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    _check_rate_limit(_client_ip(request))

    hint = ""
    if payload.winning_types:
        hint = (
            f"\nENGAGEMENT SIGNAL: Over the past week, users are engaging most with these types: "
            f"{', '.join(payload.winning_types)}. Include at least 2-3 slides of these winning "
            f"types in your 7, while still keeping variety across all 5 types."
        )

    prompt = (
        "You are writing short, uplifting micro-content for a habit-tracking app called "
        "\"Awesome Life\". Generate exactly 7 NEW and UNIQUE feed slides for today. Each "
        "slide must be one of these types: conspiracy (whimsical reframe of setbacks), "
        "reframe (positive perspective flip), affirmation (mindful encouragement), "
        "quickwin (community-style win mention), cosmic (cosmic/universe themed motivation).\n\n"
        "Return ONLY a valid JSON array (no markdown, no prose) with exactly 7 objects, each "
        "with these fields:\n"
        "- \"type\": one of \"conspiracy\" | \"reframe\" | \"affirmation\" | \"quickwin\" | \"cosmic\"\n"
        "- \"category\": matching display label — \"Witty Conspiracy\" | \"Awesome Reframe\" | "
        "\"Bloom Moment\" | \"Quick Win Spotlight\" | \"Cosmic Teaser\"\n"
        "- \"visual\": one of \"lotus\" | \"daisy\" | \"circle\" | \"stats\" | \"cosmic\"\n"
        "- \"text\": the main message, 1-2 sentences, warm and poetic, can include one emoji max\n"
        "- \"subtext\": short tag line, 2-5 words\n\n"
        "Keep voice: gentle, witty, affirming. Mix the 5 types across the 7 slides. DO NOT "
        f"repeat any of the already-seeded evergreen phrases.{hint}"
    )

    try:
        async with httpx.AsyncClient(timeout=45) as client_http:
            resp = await client_http.post(
                f"{GEMINI_BASE_URL}?key={api_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.9, "topK": 40, "topP": 0.95,
                        "maxOutputTokens": 2048,
                        "responseMimeType": "application/json",
                    },
                },
            )
        data = resp.json()
        if resp.status_code != 200 or data.get("error"):
            msg = data.get("error", {}).get("message", f"Gemini error {resp.status_code}")
            raise HTTPException(status_code=502, detail=msg)
        raw = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        # Strip ```json fences if present
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        try:
            items = json.loads(cleaned)
        except json.JSONDecodeError:
            # Try to slice between first [ and last ]
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
        raise HTTPException(status_code=500, detail=f"AI feed gen failed: {e}")


# ----- AI Coach -----

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(chat_input: ChatMessage):
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI Coach not configured")
    
    session_id = chat_input.session_id or str(uuid.uuid4())
    
    # Get user's habits for context
    habits = await db.habits.find({}, {"_id": 0}).to_list(100)
    habits_context = ""
    if habits:
        habits_context = "\n\nUser's current habits:\n"
        for h in habits:
            habits_context += f"- {h['name']} (streak: {h.get('streak', 0)} days, total: {h.get('total_completions', 0)} completions)\n"
    
    system_message = f"""You are a warm, encouraging habit coach for the 'Awesome Life Habits' app. 
Your role is to help users build positive habits and mindfulness practices.

Keep responses concise (2-4 sentences) and actionable.
Use a calm, supportive tone. Celebrate wins, no matter how small.
Suggest specific, practical tips when asked.
Reference the user's existing habits when relevant to personalize advice.
{habits_context}

Focus areas: habit formation, mindfulness, focus exercises (flower observation, expanding circle, breath counting), 
motivation, and the principles from Atomic Habits (start small, habit stacking, environment design)."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=chat_input.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        logging.error(f"AI Coach error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Coach error: {str(e)}")

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

class AICoachRequest(BaseModel):
    message: str
    habits: List[str] = []
    session_id: Optional[str] = None

@api_router.post("/ai-coach")
async def ai_coach_chat(request: AICoachRequest):
    gemini_key = os.environ.get('GEMINI_API_KEY')
    emergent_key = os.environ.get('EMERGENT_LLM_KEY')

    if not gemini_key and not emergent_key:
        raise HTTPException(status_code=500, detail="AI service not configured")

    habits_text = ', '.join(request.habits) if request.habits else 'none tracked yet'
    system_prompt = (
        "You are a supportive and knowledgeable AI habit coach. Your role is to: "
        "help users build and maintain positive habits, provide encouragement and motivation, "
        "offer practical tips for habit formation based on behavioral science, "
        "be empathetic and understanding of struggles, celebrate wins no matter how small, "
        "and keep responses concise but helpful (2-3 paragraphs max). "
        f"Current user habits: {habits_text}"
    )
    session_id = request.session_id or str(uuid.uuid4())

    # Prefer user's own Gemini key (free/cheap) over Emergent LLM key
    if gemini_key:
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser: {request.message}"}]}],
                "generationConfig": {"temperature": 0.7, "topK": 40, "topP": 0.95, "maxOutputTokens": 1024}
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, json=payload)
            data = resp.json()
            if resp.status_code == 200 and not data.get("error"):
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                return {"response": text, "session_id": session_id}
            logging.warning(f"Gemini key failed ({resp.status_code}), trying fallback")
        except Exception as e:
            logging.warning(f"Gemini direct call failed: {e}, trying fallback")

    # Fallback: Emergent LLM Key
    try:
        chat = LlmChat(
            api_key=emergent_key,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")
        response = await chat.send_message(UserMessage(text=request.message))
        return {"response": response, "session_id": session_id}
    except Exception as e:
        logging.error(f"AI Coach error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Coach failed: {str(e)}")




@api_router.post("/glow-up/generate")
async def generate_glow_up(request: GlowUpRequest):
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    try:
        session_id = str(uuid.uuid4())
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a motivational AI that creates inspiring visual transformations showing people's healthy, vibrant best selves."
        ).with_model("gemini", "gemini-2.0-flash-preview-image-generation").with_params(modalities=["image", "text"])

        full_prompt = (
            f"Transform this photo to show this person's best self after building these healthy habits: {request.goals}. "
            f"Style: {request.prompt}. "
            "Keep the person recognisable. Show them looking healthy, confident, energetic and vibrant. "
            "This is an aspirational, motivational image. Improve lighting, posture, and vitality."
        )

        image_content = ImageContent(base64_data=request.image_base64)
        msg = UserMessage(text=full_prompt, file_contents=[image_content])
        text, images = await chat.send_message_multimodal_response(msg)

        if images and len(images) > 0:
            return {
                "image_base64": images[0].get("data", ""),
                "mime_type": images[0].get("mime_type", "image/png"),
                "message": text or "Your transformation is ready!"
            }
        raise HTTPException(status_code=500, detail="No image was generated. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Glow Up generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
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
