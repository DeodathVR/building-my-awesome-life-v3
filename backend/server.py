from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    
    today = log_input.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    completions = habit.get("completions", [])
    
    if log_input.completed:
        if today not in completions:
            completions.append(today)
            completions.sort()
            
            # Calculate streak
            streak = calculate_streak(completions)
            
            await db.habits.update_one(
                {"id": log_input.habit_id},
                {
                    "$set": {
                        "completions": completions,
                        "last_completed": today,
                        "streak": streak,
                        "total_completions": len(completions)
                    }
                }
            )
    else:
        if today in completions:
            completions.remove(today)
            streak = calculate_streak(completions)
            
            await db.habits.update_one(
                {"id": log_input.habit_id},
                {
                    "$set": {
                        "completions": completions,
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
