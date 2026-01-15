import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, LayoutGrid, List, CheckCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HabitsPage = () => {
  const { habits, loading, fetchHabits, fetchStats } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('name');

  const filteredHabits = useMemo(() => {
    let result = [...habits];
    
    // Filter by search
    if (searchQuery) {
      result = result.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'completions':
          return (b.total_completions || 0) - (a.total_completions || 0);
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return result;
  }, [habits, searchQuery, sortBy]);

  const handleEditHabit = (habit) => {
    setEditHabit(habit);
    setShowAddModal(true);
  };

  const handleCloseModal = (open) => {
    setShowAddModal(open);
    if (!open) setEditHabit(null);
  };

  const handleBulkLog = async () => {
    const today = new Date().toISOString().split('T')[0];
    const incompleteHabits = habits.filter(h => !h.completions?.includes(today));
    
    if (incompleteHabits.length === 0) {
      toast.info('All habits are already completed for today!');
      return;
    }

    try {
      await axios.post(`${API}/habits/bulk-log`, incompleteHabits.map(h => h.id));
      await fetchHabits();
      await fetchStats();
      toast.success(`Logged ${incompleteHabits.length} habits!`);
    } catch (err) {
      toast.error('Failed to bulk log habits');
    }
  };

  // Generate calendar heatmap data for last 30 days
  const getHeatmapData = (habit) => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = habit.completions?.includes(dateStr);
      data.push({ date: dateStr, completed, day: date.getDate() });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pb-8 px-6 py-8" data-testid="habits-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Your Habits</h1>
            <p className="text-muted-foreground mt-1">Track, manage, and celebrate your progress</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleBulkLog}
              className="rounded-full"
              data-testid="bulk-log-button"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Log All
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="rounded-full"
              data-testid="add-habit-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Habit
            </Button>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-xl"
              data-testid="habit-search-input"
            />
          </div>
          
          <div className="flex gap-2">
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="name" className="rounded-lg">Name</TabsTrigger>
                <TabsTrigger value="streak" className="rounded-lg">Streak</TabsTrigger>
                <TabsTrigger value="completions" className="rounded-lg">Progress</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                data-testid="view-list-button"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                data-testid="view-grid-button"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Habits Display */}
        {filteredHabits.length === 0 ? (
          <Card className="p-12 rounded-2xl text-center border-dashed border-2">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">
              {searchQuery ? 'No habits found' : 'Start your journey'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Add your first habit to begin building your awesome life'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-4'
          }>
            {filteredHabits.map((habit) => (
              <div key={habit.id} className="animate-fade-in">
                <HabitCard habit={habit} onEdit={handleEditHabit} />
                
                {/* Calendar Heatmap */}
                <Card className="mt-2 p-4 rounded-xl border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last 30 days</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getHeatmapData(habit).map((day, idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-sm heatmap-cell ${
                          day.completed 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}
                        title={`${day.date}: ${day.completed ? 'Completed' : 'Not completed'}`}
                        data-testid={`heatmap-${habit.id}-${day.date}`}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddHabitModal 
        open={showAddModal} 
        onOpenChange={handleCloseModal}
        editHabit={editHabit}
      />
    </div>
  );
};

export default HabitsPage;
