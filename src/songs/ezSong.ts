import type { Song } from './types';

const ezSong: Song = {
  id: 'ez-song-1',
  name: 'E-Z Song',
  baseBpm: 60,
  assets: [],
  voices: [
    {
      id: 'piano',
      name: 'Piano',
      notes: [
        { noteName: 'C3', startAt: 0, duration: 1 },
        { noteName: 'C3', startAt: 1.5, duration: 1 },
        { noteName: 'D3', startAt: 3, duration: 1 },
        { noteName: 'D3', startAt: 4.5, duration: 1 },
        { noteName: 'E3', startAt: 6, duration: 1 },
        { noteName: 'E3', startAt: 7.5, duration: 1 },
        { noteName: 'F3', startAt: 9, duration: 1 },
        { noteName: 'F3', startAt: 10.5, duration: 1 },
        { noteName: 'G3', startAt: 12, duration: 1 },
        { noteName: 'G3', startAt: 13.5, duration: 1 },
        { noteName: 'A3', startAt: 15, duration: 1 },
        { noteName: 'A3', startAt: 16.5, duration: 1 },
        { noteName: 'B3', startAt: 18, duration: 1 },
        { noteName: 'B3', startAt: 19.5, duration: 1 },
        { noteName: 'C4', startAt: 21, duration: 1 },
        { noteName: 'C4', startAt: 22.5, duration: 1 },
        { noteName: 'D4', startAt: 24, duration: 1 },
        { noteName: 'D4', startAt: 25.5, duration: 1 },
        { noteName: 'E4', startAt: 27, duration: 1 },
        { noteName: 'E4', startAt: 28.5, duration: 1 },
      ],
    },
  ],
};

export default ezSong;
