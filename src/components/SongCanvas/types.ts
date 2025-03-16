import { Song } from '@/songs';
import { Dispatch, SetStateAction } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type PlayerState = 'stopped' | 'playing' | 'playback' | 'restart';

export interface SongCanvasContextType {
  song: Song;
  bpm: number;
  state: PlayerState;
  noteRollY: SharedValue<number>;

  setBpm: Dispatch<SetStateAction<number>>;
  startGame: (startMode: 'playing' | 'playback') => void;
  restartGame: () => void;
}
