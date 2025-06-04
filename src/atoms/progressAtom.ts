import { atom } from 'jotai';

export type Progress =
  | {
      playMode: 'playing' | 'playback';
      startedPlayingAt: number;
    }
  | {
      playMode: 'stopped' | 'restart';
      noteRollY: number;
    };

export const progressAtom = atom<Progress>({
  playMode: 'stopped',
  noteRollY: 0,
});
