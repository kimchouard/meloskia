import type { NoteName } from './songs';

export type KeysState = Record<NoteName, boolean>;

export type PlayerState = 'stopped' | 'playing' | 'playback' | 'restart';
