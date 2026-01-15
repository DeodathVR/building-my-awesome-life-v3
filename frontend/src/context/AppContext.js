import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AppProvider = ({ children }) => {
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

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/habits`);
      setHabits(res.data);
    } catch (err) {
      console.error('Error fetching habits:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Fetch community posts
  const fetchCommunityPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/community`);
      setCommunityPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  }, []);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/challenges`);
      setChallenges(res.data);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }, []);

  // Seed initial data
  const seedData = useCallback(async () => {
    try {
      await axios.post(`${API}/seed`);
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await seedData();
      await Promise.all([
        fetchHabits(),
        fetchStats(),
        fetchCommunityPosts(),
        fetchChallenges()
      ]);
      setLoading(false);
    };
    init();
  }, [seedData, fetchHabits, fetchStats, fetchCommunityPosts, fetchChallenges]);

  // Create habit
  const createHabit = async (habitData) => {
    try {
      const res = await axios.post(`${API}/habits`, habitData);
      setHabits(prev => [...prev, res.data]);
      await fetchStats();
      return res.data;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw err;
    }
  };

  // Update habit
  const updateHabit = async (habitId, habitData) => {
    try {
      const res = await axios.put(`${API}/habits/${habitId}`, habitData);
      setHabits(prev => prev.map(h => h.id === habitId ? res.data : h));
      return res.data;
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  };

  // Delete habit
  const deleteHabit = async (habitId) => {
    try {
      await axios.delete(`${API}/habits/${habitId}`);
      setHabits(prev => prev.filter(h => h.id !== habitId));
      await fetchStats();
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  };

  // Log habit completion
  const logHabit = async (habitId, completed = true) => {
    try {
      const res = await axios.post(`${API}/habits/log`, { habit_id: habitId, completed });
      setHabits(prev => prev.map(h => h.id === habitId ? res.data : h));
      await fetchStats();
      return res.data;
    } catch (err) {
      console.error('Error logging habit:', err);
      throw err;
    }
  };

  // Create community post
  const createPost = async (content) => {
    try {
      const res = await axios.post(`${API}/community`, { content });
      setCommunityPosts(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  // Like post
  const likePost = async (postId) => {
    try {
      await axios.post(`${API}/community/${postId}/like`);
      setCommunityPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Chat with AI coach
  const chatWithCoach = async (message, sessionId = null) => {
    try {
      const res = await axios.post(`${API}/chat`, { message, session_id: sessionId });
      return res.data;
    } catch (err) {
      console.error('Error chatting with coach:', err);
      throw err;
    }
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
