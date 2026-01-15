import React, { useState } from 'react';
import { Check, Flame, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';

const HabitCard = ({ habit, onEdit }) => {
  const { logHabit, deleteHabit } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions?.includes(today);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      await logHabit(habit.id, !isCompletedToday);
    } catch (err) {
      console.error('Error logging habit:', err);
    }
    setTimeout(() => setIsChecking(false), 300);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${habit.name}"?`)) {
      await deleteHabit(habit.id);
    }
  };

  // Calculate progress (e.g., weekly completion rate)
  const weeklyProgress = Math.min(100, (habit.total_completions / 7) * 100);

  return (
    <div 
      className={`
        bg-card border border-border/50 rounded-2xl p-5 
        shadow-sm hover:shadow-md transition-all duration-300 
        group relative overflow-hidden
        ${isCompletedToday ? 'ring-2 ring-primary/20' : ''}
      `}
      data-testid={`habit-card-${habit.id}`}
    >
      {/* Success glow effect */}
      {isCompletedToday && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="relative">
          <Checkbox
            checked={isCompletedToday}
            onCheckedChange={handleCheck}
            disabled={isChecking}
            data-testid={`habit-checkbox-${habit.id}`}
            className={`
              w-7 h-7 rounded-xl border-2 transition-all duration-300
              ${isCompletedToday 
                ? 'bg-primary border-primary data-[state=checked]:bg-primary' 
                : 'border-border hover:border-primary/50'
              }
              ${isChecking ? 'animate-check-bounce' : ''}
            `}
          />
          {isCompletedToday && (
            <div className="absolute -inset-1 bg-accent/30 rounded-xl animate-ping opacity-0 group-hover:opacity-100" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 
              className={`font-heading text-lg font-semibold truncate ${
                isCompletedToday ? 'text-primary' : 'text-foreground'
              }`}
              data-testid={`habit-name-${habit.id}`}
            >
              {habit.name}
            </h3>
            {habit.streak > 0 && (
              <div 
                className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full"
                data-testid={`habit-streak-${habit.id}`}
              >
                <Flame className="w-3.5 h-3.5 text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground">{habit.streak}</span>
              </div>
            )}
          </div>
          
          {habit.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {habit.description}
            </p>
          )}

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{habit.total_completions} total</span>
              <span>{habit.frequency}</span>
            </div>
            <Progress 
              value={weeklyProgress} 
              className="h-1.5"
              data-testid={`habit-progress-${habit.id}`}
            />
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`habit-menu-${habit.id}`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(habit)} data-testid={`habit-edit-${habit.id}`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-destructive"
              data-testid={`habit-delete-${habit.id}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Completed indicator */}
      {isCompletedToday && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
