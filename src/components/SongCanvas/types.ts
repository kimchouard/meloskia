import { Song } from '@/songs';
import { Dispatch, SetStateAction } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type PlayerState = 'stopped' | 'playing' | 'playback' | 'restart';

export interface SongCanvasContextType {
  song: Song;

  bpm: number;
  metronome: 0 | 1 | 2 | 4;

  state: PlayerState;
  isLoading: boolean;

  noteRollY: SharedValue<number>;

  restartGame: () => void;
  startGame: (startMode: 'playing' | 'playback') => void;

  setBpm: Dispatch<SetStateAction<number>>;
  setMetronome: Dispatch<SetStateAction<0 | 1 | 2 | 4>>;
}
