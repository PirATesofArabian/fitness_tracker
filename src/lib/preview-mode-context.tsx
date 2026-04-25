'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PreviewModeContextType {
  isPreviewMode: boolean;
  setPreviewMode: (value: boolean) => void;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <PreviewModeContext.Provider value={{ isPreviewMode, setPreviewMode: setIsPreviewMode }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error('usePreviewMode must be used within a PreviewModeProvider');
  }
  return context;
}

// Made with Bob
