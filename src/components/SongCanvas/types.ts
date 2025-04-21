import { Dispatch, SetStateAction } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { Song } from '@/songs';
import { PlayerState } from '@/types';

export interface SongCanvasContextType {
  song: Song;

  bpm: number;
  setBpm: Dispatch<SetStateAction<number>>;

  metronome: 0 | 1 | 2 | 4;
  setMetronome: Dispatch<SetStateAction<0 | 1 | 2 | 4>>;

  state: PlayerState;
  isLoading: boolean;

  noteRollY: SharedValue<number>;

  restartGame: () => void;
  startGame: (startMode: 'playing' | 'playback') => void;
}
