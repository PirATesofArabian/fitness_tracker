'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Bug, 
  Trash2, 
  AlertTriangle, 
  Shield,
  X
} from 'lucide-react';
import { 
  CHANGELOG, 
  getLatestVersion, 
  shouldShowChangelog, 
  markVersionAsSeen,
  type ChangelogEntry 
} from '@/lib/changelog';

interface ChangelogDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChangelogDialog({ open: controlledOpen, onOpenChange }: ChangelogDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(getLatestVersion());

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  useEffect(() => {
    // Auto-show changelog on first visit after update
    if (!isControlled && shouldShowChangelog()) {
      setInternalOpen(true);
    }
  }, [isControlled]);

  const handleClose = () => {
    markVersionAsSeen(getLatestVersion());
    setOpen(false);
  };

  const selectedChangelog = CHANGELOG.find(entry => entry.version === selectedVersion);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'changed':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'fixed':
        return <Bug className="h-4 w-4 text-orange-500" />;
      case 'removed':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'deprecated':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What's New
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Version Selector */}
          <div className="flex gap-2 flex-wrap pb-2 border-b">
            {CHANGELOG.map((entry) => (
              <button
                key={entry.version}
                onClick={() => setSelectedVersion(entry.version)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedVersion === entry.version
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                v{entry.version}
                {entry.version === getLatestVersion() && (
                  <Badge variant="secondary" className="ml-2 text-xs">Latest</Badge>
                )}
              </button>
            ))}
          </div>

          {/* Selected Version Details */}
          {selectedChangelog && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Version {selectedChangelog.version}</h3>
                <span className="text-sm text-muted-foreground">{selectedChangelog.date}</span>
              </div>

              {/* Changes by Category */}
              {Object.entries(selectedChangelog.changes).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <h4 className="font-medium text-sm">{getCategoryLabel(category)}</h4>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                      {items.map((item, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleClose} className="w-full">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Badge component for "New" indicator
export function ChangelogBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(shouldShowChangelog());
  }, []);

  if (!show) return null;

  return (
    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
      <Sparkles className="h-3 w-3" />
    </Badge>
  );
}

// Made with Bob
