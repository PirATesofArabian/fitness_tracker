'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Pencil, Trash2, Save, X } from 'lucide-react';
import { DailyWeight } from '@/lib/types';

interface WeightHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weights: DailyWeight[];
  onUpdate: (id: string, updates: Partial<DailyWeight>) => void;
  onDelete: (id: string) => void;
}

export function WeightHistory({ open, onOpenChange, weights, onUpdate, onDelete }: WeightHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const startEdit = (weight: DailyWeight) => {
    setEditingId(weight.id);
    setEditWeight(weight.weight.toString());
    setEditNotes(weight.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight('');
    setEditNotes('');
  };

  const saveEdit = (id: string) => {
    if (!editWeight || parseFloat(editWeight) <= 0) {
      return;
    }

    onUpdate(id, {
      weight: parseFloat(editWeight),
      notes: editNotes || undefined,
    });
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this weight entry?')) {
      onDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight History ({weights.length} entries)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {weights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No weight entries yet. Start logging your daily weight!
            </p>
          ) : (
            weights.map((weight) => (
              <div
                key={weight.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                {editingId === weight.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Weight (kg)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Date</label>
                        <Input
                          value={weight.date}
                          disabled
                          className="h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Notes</label>
                      <Input
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Optional notes"
                        className="h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex-1"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(weight.id)}
                        className="flex-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(weight.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-lg font-semibold">{weight.weight} kg</span>
                      </div>
                      {weight.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{weight.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(weight)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(weight.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
