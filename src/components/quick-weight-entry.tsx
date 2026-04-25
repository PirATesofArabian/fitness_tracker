'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Save } from 'lucide-react';
import { DailyWeight } from '@/lib/types';

interface QuickWeightEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (weight: DailyWeight) => void;
  initialWeight?: number;
}

export function QuickWeightEntry({ open, onOpenChange, onSave, initialWeight }: QuickWeightEntryProps) {
  const [weight, setWeight] = useState(initialWeight?.toString() || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || parseFloat(weight) <= 0) {
      return;
    }

    const weightEntry: DailyWeight = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight),
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    onSave(weightEntry);
    setWeight('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Log Today's Weight
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg) *</label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="79.5"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feeling good, morning weight"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
