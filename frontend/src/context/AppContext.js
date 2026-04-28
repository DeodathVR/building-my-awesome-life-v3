import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  setDoc,
  Timestamp 
} from 'firebase/firestore';

const AppContext = createContext();

// Backend URL for API calls (Glow Up image generation + AI chat proxy)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// XHR-based POST that bypasses PostHog's fetch wrapper
const xhrPost = (url, body) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => {
    try { resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, data: JSON.parse(xhr.responseText) }); }
    catch (e) { reject(new Error(`Parse error (${xhr.status})`)); }
  };
  xhr.onerror = () => reject(new Error('Network error'));
  xhr.send(JSON.stringify(body));
});

// Collection references
const HABITS_COLLECTION = 'habits';
const POSTS_COLLECTION = 'community_posts';
const CHALLENGES_COLLECTION = 'challenges';

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initial seed data
const SEED_HABITS = [
  {
    name: 'Morning Meditation',
    description: 'Start each day with 10 minutes of mindful meditation',
    frequency: 'daily',
    streak: 3,
    completions: [],
    last_completed: null,
    created_at: new Date().toISOString()
  },
  {
    name: 'Read for 30 minutes',
    description: 'Read books that expand your mind and perspective',
    frequency: 'daily',
    streak: 5,
    completions: [],
    last_completed: null,
    created_at: new Date().toISOString()
  },
  {
    name: 'Exercise',
    description: 'Move your body for at least 30 minutes',
    frequency: 'daily',
    streak: 2,
    completions: [],
    last_completed: null,
    created_at: new Date().toISOString()
  },
  {
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    frequency: 'daily',
    streak: 7,
    completions: [],
    last_completed: null,
    created_at: new Date().toISOString()
  },
  {
    name: 'Journal',
    description: 'Write down your thoughts and reflections',
    frequency: 'daily',
    streak: 1,
    completions: [],
    last_completed: null,
    created_at: new Date().toISOString()
  }
];

const SEED_POSTS = [
  {
    content: "Just completed my 30-day meditation streak! The clarity I feel is incredible. 🧘‍♀️",
    likes: 24,
    created_at: new Date().toISOString()
  },
  {
    content: "Small wins matter. Even 5 minutes of reading is better than none. Keep going everyone! 📚",
    likes: 18,
    created_at: new Date().toISOString()
  },
  {
    content: "Started waking up at 5 AM this week. The quiet morning hours are pure magic. ✨",
    likes: 31,
    created_at: new Date().toISOString()
  }
];

const SEED_CHALLENGES = [
  {
    title: '7-Day Meditation Challenge',
    description: 'Meditate for at least 10 minutes every day for 7 days',
    duration: 7,
    participants: 156,
    category: 'mindfulness'
  },
  {
    title: '30-Day Reading Challenge',
    description: 'Read at least 20 pages every day for 30 days',
    duration: 30,
    participants: 89,
    category: 'learning'
  },
  {
    title: 'Hydration Hero',
    description: 'Drink 8 glasses of water daily for 14 days',
    duration: 14,
    participants: 234,
    category: 'health'
  }
];

export const AppProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Calculate stats from habits
  const calculateStats = useCallback((habitsData) => {
    const today = new Date().toISOString().split('T')[0];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = weekDays[date.getDay()];
      
      const completions = habitsData.filter(h => 
        h.completions && h.completions.includes(dateStr)
      ).length;
      
      weeklyData.push({ day: dayName, completions });
    }

    const totalCompletions = habitsData.reduce((acc, h) => 
      acc + (h.completions ? h.completions.length : 0), 0
    );
    
    const maxStreak = Math.max(...habitsData.map(h => h.streak || 0), 0);
    const totalStreak = habitsData.reduce((acc, h) => acc + (h.streak || 0), 0);

    return {
      total_habits: habitsData.length,
      total_completions: totalCompletions,
      max_streak: maxStreak,
      total_streak: totalStreak,
      weekly_data: weeklyData
    };
  }, []);

  // Fetch habits from Firestore (scoped to current user)
  const fetchHabits = useCallback(async () => {
    if (!user) { setHabits([]); setStats(null); return []; }
    try {
      const habitsRef = collection(db, HABITS_COLLECTION);
      const q = query(habitsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
      setStats(calculateStats(habitsData));
      return habitsData;
    } catch (err) {
      console.error('Error fetching habits:', err);
      return [];
    }
  }, [user, calculateStats]);

  // Fetch stats (calculated from habits)
  const fetchStats = useCallback(async () => {
    const habitsData = await fetchHabits();
    const calculatedStats = calculateStats(habitsData);
    setStats(calculatedStats);
    return calculatedStats;
  }, [fetchHabits, calculateStats]);

  // Fetch community posts from Firestore
  const fetchCommunityPosts = useCallback(async () => {
    try {
      const postsRef = collection(db, POSTS_COLLECTION);
      const q = query(postsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCommunityPosts(postsData);
      return postsData;
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    }
  }, []);

  // Fetch challenges from Firestore
  const fetchChallenges = useCallback(async () => {
    try {
      const challengesRef = collection(db, CHALLENGES_COLLECTION);
      const snapshot = await getDocs(challengesRef);
      const challengesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChallenges(challengesData);
      return challengesData;
    } catch (err) {
      console.error('Error fetching challenges:', err);
      return [];
    }
  }, []);

  // Seed initial data if this user has no habits (and do legacy cleanup for admin)
  const seedData = useCallback(async () => {
    if (!user) return;
    try {
      // ADMIN ONLY: auto-clean legacy habits that have no userId (pre-auth shared data)
      if (isAdmin) {
        const alreadyCleaned = localStorage.getItem('alu_legacy_cleaned_v1');
        if (!alreadyCleaned) {
          const habitsRef = collection(db, HABITS_COLLECTION);
          const all = await getDocs(habitsRef);
          const legacy = all.docs.filter(d => !d.data().userId);
          for (const d of legacy) {
            await deleteDoc(doc(db, HABITS_COLLECTION, d.id));
          }
          localStorage.setItem('alu_legacy_cleaned_v1', '1');
          if (legacy.length > 0) console.log(`Cleaned ${legacy.length} legacy habits`);
        }
      }

      // Per-user seed: only if THIS user has no habits yet
      const habitsRef = collection(db, HABITS_COLLECTION);
      const mySnap = await getDocs(query(habitsRef, where('userId', '==', user.uid)));

      if (mySnap.empty) {
        for (const habit of SEED_HABITS) {
          const id = generateId();
          await setDoc(doc(db, HABITS_COLLECTION, id), {
            ...habit,
            id,
            userId: user.uid,
          });
        }
      }

      // Community posts + challenges are GLOBAL — only seed if the whole collection is empty
      const postsRef = collection(db, POSTS_COLLECTION);
      const postsSnapshot = await getDocs(postsRef);
      if (postsSnapshot.empty) {
        for (const post of SEED_POSTS) {
          const id = generateId();
          await setDoc(doc(db, POSTS_COLLECTION, id), { ...post, id });
        }
      }

      const challengesRef = collection(db, CHALLENGES_COLLECTION);
      const challengesSnapshot = await getDocs(challengesRef);
      if (challengesSnapshot.empty) {
        for (const challenge of SEED_CHALLENGES) {
          const id = generateId();
          await setDoc(doc(db, CHALLENGES_COLLECTION, id), { ...challenge, id });
        }
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  }, [user, isAdmin]);

  // Load data whenever user changes (login/logout)
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setStats(null);
      setCommunityPosts([]);
      setChallenges([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      await seedData();
      if (cancelled) return;
      await Promise.all([
        fetchHabits(),
        fetchCommunityPosts(),
        fetchChallenges()
      ]);
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, [user, seedData, fetchHabits, fetchCommunityPosts, fetchChallenges]);

  // Create habit
  const createHabit = async (habitData) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const id = generateId();
      const newHabit = {
        id,
        userId: user.uid,
        name: habitData.name,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily',
        streak: 0,
        completions: [],
        last_completed: null,
        created_at: new Date().toISOString()
      };
      
      await setDoc(doc(db, HABITS_COLLECTION, id), newHabit);
      setHabits(prev => [...prev, newHabit]);
      setStats(calculateStats([...habits, newHabit]));
      return newHabit;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw err;
    }
  };

  // Update habit
  const updateHabit = async (habitId, habitData) => {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      await updateDoc(habitRef, habitData);
      
      const updatedHabit = { ...habits.find(h => h.id === habitId), ...habitData };
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  };

  // Delete habit
  const deleteHabit = async (habitId) => {
    try {
      await deleteDoc(doc(db, HABITS_COLLECTION, habitId));
      const newHabits = habits.filter(h => h.id !== habitId);
      setHabits(newHabits);
      setStats(calculateStats(newHabits));
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  };

  // Log habit completion
  const logHabit = async (habitId, completed = true, date = null) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const targetDate = date || new Date().toISOString().split('T')[0];
      let newCompletions = [...(habit.completions || [])];
      let newStreak = habit.streak || 0;

      if (completed) {
        if (!newCompletions.includes(targetDate)) {
          newCompletions.push(targetDate);
          newCompletions.sort();
          
          // Calculate streak
          const today = new Date().toISOString().split('T')[0];
          if (targetDate === today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (habit.last_completed === yesterdayStr || habit.last_completed === today) {
              newStreak = newStreak + 1;
            } else {
              newStreak = 1;
            }
          }
        }
      } else {
        newCompletions = newCompletions.filter(d => d !== targetDate);
      }

      const updates = {
        completions: newCompletions,
        streak: newStreak,
        last_completed: completed ? targetDate : habit.last_completed
      };

      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      await updateDoc(habitRef, updates);

      const updatedHabit = { ...habit, ...updates };
      const newHabits = habits.map(h => h.id === habitId ? updatedHabit : h);
      setHabits(newHabits);
      setStats(calculateStats(newHabits));
      return updatedHabit;
    } catch (err) {
      console.error('Error logging habit:', err);
      throw err;
    }
  };

  // Create community post
  const createPost = async (content) => {
    try {
      const id = generateId();
      const newPost = {
        id,
        content,
        likes: 0,
        created_at: new Date().toISOString()
      };
      
      await setDoc(doc(db, POSTS_COLLECTION, id), newPost);
      setCommunityPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  // Like post
  const likePost = async (postId) => {
    try {
      const post = communityPosts.find(p => p.id === postId);
      if (!post) return;

      const newLikes = (post.likes || 0) + 1;
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, { likes: newLikes });
      
      setCommunityPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: newLikes } : p
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Chat with AI coach — proxies through backend (hides Gemini API key)
  const chatWithCoach = async (message, sessionId = null) => {
    if (!BACKEND_URL) throw new Error('Backend URL not configured.');

    const systemPrompt = `You are a supportive and knowledgeable AI habit coach. Your role is to:
- Help users build and maintain positive habits
- Provide encouragement and motivation
- Offer practical tips for habit formation based on behavioral science
- Be empathetic and understanding of struggles
- Celebrate wins, no matter how small
- Keep responses concise but helpful (2-3 paragraphs max)
Current user habits: ${habits.map(h => h.name).join(', ')}`;

    const result = await xhrPost(`${BACKEND_URL}/api/ai/chat`, {
      message,
      system_prompt: systemPrompt,
      temperature: 0.7,
      max_output_tokens: 1024,
    });

    if (!result.ok) {
      const err = result.data?.detail || `Request failed with status ${result.status}`;
      if (result.status === 429) throw new Error(err);
      throw new Error(err);
    }

    return { response: result.data.response || "I'm having trouble responding right now.", session_id: sessionId || generateId() };
  };

  const value = {
    habits,
    stats,
    communityPosts,
    challenges,
    loading,
    darkMode,
    setDarkMode,
    fetchHabits,
    fetchStats,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    createPost,
    likePost,
    chatWithCoach
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
