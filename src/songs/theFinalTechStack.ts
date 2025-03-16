import type { Song, SongAsset, Voice } from './types';

const assets: SongAsset[] = [
  {
    id: 'the-final-tech-stack_instrumental',
    url: '/final-tech-stack/the-final-tech-stack_instrumental.mp3',
    name: 'Instrumental',
    type: 'backingTrack',
    volume: 1,
  },
  {
    id: 'the-final-tech-stack_clicks',
    url: '/final-tech-stack/the-final-tech-stack_clicks.mp3',
    name: 'Clicks',
    type: 'backingTrack',
    volume: 1,
  },
];

const pianoVoice: Voice = {
  id: 'piano',
  name: 'Piano',
  notes: [
    { noteName: 'C#4', startAt: 0, duration: 0.25 }, // 1
    { noteName: 'B3', startAt: 0.25, duration: 0.25 }, // 1
    { noteName: 'C#4', startAt: 0.5, duration: 1 }, // 2
    { noteName: 'F#3', startAt: 1.5, duration: 1.5 }, // 4

    // GAP * 2

    { noteName: 'D4', startAt: 4, duration: 0.25 }, // 1
    { noteName: 'C#4', startAt: 4.25, duration: 0.25 }, // 1
    { noteName: 'D4', startAt: 4.5, duration: 0.25 }, // 1
    // GAP
    { noteName: 'C#4', startAt: 5, duration: 0.25 }, // 1
    // GAP
    { noteName: 'B3', startAt: 5.5, duration: 1.25 }, // 4

    // GAP * 2

    { noteName: 'D4', startAt: 8, duration: 0.25 }, // 1
    { noteName: 'C#4', startAt: 8.25, duration: 0.25 }, // 1
    { noteName: 'D4', startAt: 8.5, duration: 1 }, // 2
    { noteName: 'F#3', startAt: 9.5, duration: 1.5 }, // 4

    // GAP * 2

    { noteName: 'B3', startAt: 12, duration: 0.25 }, // 1
    { noteName: 'A3', startAt: 12.25, duration: 0.25 }, // 1
    { noteName: 'B3', startAt: 12.5, duration: 0.25 }, // 1
    // GAP
    { noteName: 'A3', startAt: 13, duration: 0.25 }, // 1
    // GAP
    { noteName: 'G#3', startAt: 13.5, duration: 0.25 }, // 1
    // GAP
    { noteName: 'B3', startAt: 14, duration: 0.25 }, // 1
    // GAP
    { noteName: 'A3', startAt: 14.5, duration: 1.25 }, // 4

    // TODO: intro x2 !

    { noteName: 'G#3', startAt: 16, duration: 0.25 }, // 1
    { noteName: 'A3', startAt: 16.25, duration: 0.25 }, // 1
    { noteName: 'B3', startAt: 16.5, duration: 1.25 }, // 4
    // GAP
    { noteName: 'A3', startAt: 18, duration: 0.25 }, // 1
    { noteName: 'B3', startAt: 18.25, duration: 0.25 }, // 1
    { noteName: 'C#4', startAt: 18.5, duration: 0.5 }, // 1.5
    { noteName: 'B3', startAt: 19, duration: 0.5 }, // 1.5
    { noteName: 'A3', startAt: 19.5, duration: 0.5 }, // 1.5
    { noteName: 'G#3', startAt: 20, duration: 0.5 }, // 1 / 1.5?
    { noteName: 'F#3', startAt: 20.5, duration: 1 }, // 2
    { noteName: 'D4', startAt: 21.5, duration: 1 }, // 2
    { noteName: 'C#4', startAt: 22.5, duration: 2 }, // 4
    // GAP
    { noteName: 'C#4', startAt: 24.75, duration: 0.5 }, // 1
    { noteName: 'D4', startAt: 25.25, duration: 0.5 }, // 1
    { noteName: 'C#4', startAt: 25.75, duration: 0.5 }, // 1
    { noteName: 'B3', startAt: 26.25, duration: 0.5 }, // 1
    { noteName: 'C#4', startAt: 26.75, duration: 3 }, // 4
  ],
};

const theFinalTechStack: Song = {
  id: 'the-final-tech-stack-1',
  name: 'The Final Tech Stack',
  baseBpm: 120,
  assets,
  voices: [pianoVoice],
};

export default theFinalTechStack;
