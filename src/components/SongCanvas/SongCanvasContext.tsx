import { createContext, useContext } from 'react';

import { SongCanvasContextType } from './types';

export const SongCanvasContext = createContext<SongCanvasContextType | null>(
  null
);

export function useSongCanvasContext() {
  const context = useContext(SongCanvasContext);

  if (!context) {
    throw new Error('useCanvasContext must be used within a SongCanvas');
  }

  return context;
}
