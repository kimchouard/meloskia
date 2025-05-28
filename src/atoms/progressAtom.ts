import { atom } from 'jotai';
// import { PrimitiveAtom, useSetAtom } from 'jotai';
// import { useReadAtom } from '@/hooks/useReadAtom';

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
