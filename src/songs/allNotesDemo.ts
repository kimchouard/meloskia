import type { Song } from './types';

const allNotesDemo: Song = {
  id: 'all-notes-demo-1',
  name: 'All-notes Demo',
  baseBpm: 160,
  assets: [],
  voices: [
    {
      id: 'piano',
      name: 'Piano',
      notes: [
        { noteName: 'C3', startAt: 0, duration: 1 },
        { noteName: 'D3', startAt: 1, duration: 1 },
        { noteName: 'E3', startAt: 2, duration: 1 },
        { noteName: 'F3', startAt: 3, duration: 1 },
        { noteName: 'G3', startAt: 4, duration: 1 },
        { noteName: 'A3', startAt: 5, duration: 1 },
        { noteName: 'B3', startAt: 6, duration: 1 },
        { noteName: 'C4', startAt: 7, duration: 1 },
        { noteName: 'D4', startAt: 8, duration: 1 },
        { noteName: 'E4', startAt: 9, duration: 1 },
        { noteName: 'D#4', startAt: 10, duration: 1 },
        { noteName: 'C#4', startAt: 11, duration: 1 },
        { noteName: 'A#3', startAt: 12, duration: 1 },
        { noteName: 'G#3', startAt: 13, duration: 1 },
        { noteName: 'F#3', startAt: 14, duration: 1 },
        { noteName: 'D#3', startAt: 15, duration: 1 },
        { noteName: 'C#3', startAt: 16, duration: 1 },
      ],
    },
  ],
};

export default allNotesDemo;
