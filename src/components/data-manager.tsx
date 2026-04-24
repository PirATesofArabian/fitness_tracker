'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/hooks';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

export function DataManager() {
  const { data } = useLocalStorage();
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setImportPreview(imported);
        setShowImport(true);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (importPreview && confirm('This will replace all your current data. Continue?')) {
      localStorage.setItem('fitness_tracker_data', JSON.stringify(importPreview));
      window.location.reload();
    }
  };

  const clearAllData = () => {
    if (confirm('Delete ALL data? This cannot be undone!')) {
      localStorage.removeItem('fitness_tracker_data');
      window.location.reload();
    }
  };

  const stats = {
    meals: data.meals.length,
    workouts: data.workouts.length,
    bodyComps: data.bodyComps.length,
    dailyLogs: data.dailyLogs.length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{stats.meals}</p>
              <p className="text-xs text-muted-foreground">Meals</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{stats.workouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{stats.bodyComps}</p>
              <p className="text-xs text-muted-foreground">Body Logs</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{stats.dailyLogs}</p>
              <p className="text-xs text-muted-foreground">Daily Logs</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Export Data (JSON)
            </Button>
            
            <Button variant="outline" onClick={handleImportClick} className="w-full">
              <Upload className="h-4 w-4 mr-2" /> Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button variant="destructive" onClick={clearAllData} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">This will replace your current data with:</p>
            {importPreview && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Meals: {importPreview.meals?.length || 0}</div>
                <div>Workouts: {importPreview.workouts?.length || 0}</div>
                <div>BodyComps: {importPreview.bodyComps?.length || 0}</div>
                <div>DailyLogs: {importPreview.dailyLogs?.length || 0}</div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImport(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmImport} className="flex-1">
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}