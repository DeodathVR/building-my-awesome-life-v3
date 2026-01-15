import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const AddHabitModal = ({ open, onOpenChange, editHabit = null }) => {
  const { createHabit, updateHabit } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily'
  });

  useEffect(() => {
    if (editHabit) {
      setFormData({
        name: editHabit.name || '',
        description: editHabit.description || '',
        frequency: editHabit.frequency || 'daily'
      });
    } else {
      setFormData({ name: '', description: '', frequency: 'daily' });
    }
  }, [editHabit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    setLoading(true);
    try {
      if (editHabit) {
        await updateHabit(editHabit.id, formData);
        toast.success('Habit updated!');
      } else {
        await createHabit(formData);
        toast.success('Habit created!', { description: `"${formData.name}" added to your list` });
      }
      onOpenChange(false);
      setFormData({ name: '', description: '', frequency: 'daily' });
    } catch (err) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="add-habit-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {editHabit ? 'Edit Habit' : 'Add New Habit'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Meditation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
              data-testid="habit-name-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What does this habit involve?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl resize-none"
              rows={3}
              data-testid="habit-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select 
              value={formData.frequency} 
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger className="rounded-xl" data-testid="habit-frequency-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-primary hover:bg-primary/90"
              data-testid="habit-submit-button"
            >
              {loading ? 'Saving...' : editHabit ? 'Update' : 'Add Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitModal;
