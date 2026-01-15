import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Flame, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const HomePage = () => {
  const { habits, stats, loading } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);

  const handleEditHabit = (habit) => {
    setEditHabit(habit);
    setShowAddModal(true);
  };

  const handleCloseModal = (open) => {
    setShowAddModal(open);
    if (!open) setEditHabit(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pb-8" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-bg hero-gradient relative py-16 md:py-24 px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Build Your Awesome Life,{' '}
              <span className="text-primary">One Habit at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Log, track, and master habits with AI guidance, focus exercises, and community inspiration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="rounded-full px-8 py-6 text-base shadow-hover hover:-translate-y-0.5 transition-all"
                data-testid="hero-add-habit-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Habit
              </Button>
              <Link to="/focus">
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-base hover:bg-secondary"
                  data-testid="hero-focus-button"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Focus Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-6 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 rounded-2xl shadow-soft border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-habits">{stats?.total_habits || 0}</p>
                  <p className="text-sm text-muted-foreground">Habits</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl shadow-soft border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-max-streak">{stats?.max_streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl shadow-soft border-border/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-completions">{stats?.total_completions || 0}</p>
                  <p className="text-sm text-muted-foreground">Completions</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-2xl shadow-soft border-border/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-streak">{stats?.total_streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Streak</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Habits List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl md:text-3xl font-semibold">Today's Habits</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddModal(true)}
                  className="rounded-full"
                  data-testid="add-habit-button"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add
                </Button>
              </div>

              {habits.length === 0 ? (
                <Card className="p-8 rounded-2xl text-center border-dashed border-2">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">No habits yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your awesome life by adding your first habit.</p>
                  <Button onClick={() => setShowAddModal(true)} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4 stagger-children">
                  {habits.map((habit) => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                      onEdit={handleEditHabit}
                    />
                  ))}
                </div>
              )}

              <Link to="/habits" className="block">
                <Button variant="outline" className="w-full rounded-full" data-testid="view-all-habits-button">
                  View All Habits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weekly Chart */}
              <Card className="p-6 rounded-2xl shadow-soft border-border/50">
                <h3 className="font-heading text-lg font-semibold mb-4">Weekly Progress</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.weekly_data || []}>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="completions" 
                        fill="hsl(var(--primary))" 
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 rounded-2xl shadow-soft border-border/50">
                <h3 className="font-heading text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/focus" className="block">
                    <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Focus Practice</p>
                          <p className="text-sm text-muted-foreground">5 min flower observation</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                  <Link to="/coach" className="block">
                    <div className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">AI Coach</p>
                          <p className="text-sm text-muted-foreground">Get personalized advice</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Modal */}
      <AddHabitModal 
        open={showAddModal} 
        onOpenChange={handleCloseModal}
        editHabit={editHabit}
      />
    </div>
  );
};

export default HomePage;
