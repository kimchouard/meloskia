export interface BackingTrack {
  type: 'instrumental' | 'clicks';
  volume: number;
  url: string;
}

export interface SongNote {
  noteName: string;
  startAtBar: number;
  durationInBars: number;
}

export interface SongData {
  id: number;
  name: string;
  bpm: number;
  notes: SongNote[];
  backingTracks: BackingTrack[];
}

const allNotesDemo: SongData = {
  id: 0,
  name: 'All-notes Demo',
  backingTracks: [],
  bpm: 160,
  notes: [
    { noteName: 'C3', startAtBar: 0, durationInBars: 1 },
    { noteName: 'D3', startAtBar: 1, durationInBars: 1 },
    { noteName: 'E3', startAtBar: 2, durationInBars: 1 },
    { noteName: 'F3', startAtBar: 3, durationInBars: 1 },
    { noteName: 'G3', startAtBar: 4, durationInBars: 1 },
    { noteName: 'A3', startAtBar: 5, durationInBars: 1 },
    { noteName: 'B3', startAtBar: 6, durationInBars: 1 },
    { noteName: 'C4', startAtBar: 7, durationInBars: 1 },
    { noteName: 'D4', startAtBar: 8, durationInBars: 1 },
    { noteName: 'E4', startAtBar: 9, durationInBars: 1 },
    { noteName: 'D#4', startAtBar: 10, durationInBars: 1 },
    { noteName: 'C#4', startAtBar: 11, durationInBars: 1 },
    { noteName: 'A#3', startAtBar: 12, durationInBars: 1 },
    { noteName: 'G#3', startAtBar: 13, durationInBars: 1 },
    { noteName: 'F#3', startAtBar: 14, durationInBars: 1 },
    { noteName: 'D#3', startAtBar: 15, durationInBars: 1 },
    { noteName: 'C#3', startAtBar: 16, durationInBars: 1 },
  ],
};

const allNotesDemoReversed: SongData = {
  id: 1,
  name: 'All-notes Demo (reversed)',
  backingTracks: [],
  bpm: 160,
  notes: [
    { noteName: 'C#3', startAtBar: 0, durationInBars: 1 },
    { noteName: 'D#3', startAtBar: 1, durationInBars: 1 },
    { noteName: 'F#3', startAtBar: 2, durationInBars: 1 },
    { noteName: 'G#3', startAtBar: 3, durationInBars: 1 },
    { noteName: 'A#3', startAtBar: 4, durationInBars: 1 },
    { noteName: 'C#4', startAtBar: 5, durationInBars: 1 },
    { noteName: 'D#4', startAtBar: 6, durationInBars: 1 },
    { noteName: 'E4', startAtBar: 7, durationInBars: 1 },
    { noteName: 'D4', startAtBar: 8, durationInBars: 1 },
    { noteName: 'C4', startAtBar: 9, durationInBars: 1 },
    { noteName: 'B3', startAtBar: 10, durationInBars: 1 },
    { noteName: 'A3', startAtBar: 11, durationInBars: 1 },
    { noteName: 'G3', startAtBar: 12, durationInBars: 1 },
    { noteName: 'F3', startAtBar: 13, durationInBars: 1 },
    { noteName: 'E3', startAtBar: 14, durationInBars: 1 },
    { noteName: 'D3', startAtBar: 15, durationInBars: 1 },
    { noteName: 'C3', startAtBar: 16, durationInBars: 1 },
  ],
};

const ezSong: SongData = {
  id: 2,
  name: 'E-Z Song',
  bpm: 60,
  backingTracks: [],
  notes: [
    { noteName: 'C3', startAtBar: 0, durationInBars: 1 },
    { noteName: 'C3', startAtBar: 1.5, durationInBars: 1 },
    { noteName: 'D3', startAtBar: 3, durationInBars: 1 },
    { noteName: 'D3', startAtBar: 4.5, durationInBars: 1 },
    { noteName: 'E3', startAtBar: 6, durationInBars: 1 },
    { noteName: 'E3', startAtBar: 7.5, durationInBars: 1 },
    { noteName: 'F3', startAtBar: 9, durationInBars: 1 },
    { noteName: 'F3', startAtBar: 10.5, durationInBars: 1 },
    { noteName: 'G3', startAtBar: 12, durationInBars: 1 },
    { noteName: 'G3', startAtBar: 13.5, durationInBars: 1 },
    { noteName: 'A3', startAtBar: 15, durationInBars: 1 },
    { noteName: 'A3', startAtBar: 16.5, durationInBars: 1 },
    { noteName: 'B3', startAtBar: 18, durationInBars: 1 },
    { noteName: 'B3', startAtBar: 19.5, durationInBars: 1 },
    { noteName: 'C4', startAtBar: 21, durationInBars: 1 },
    { noteName: 'C4', startAtBar: 22.5, durationInBars: 1 },
    { noteName: 'D4', startAtBar: 24, durationInBars: 1 },
    { noteName: 'D4', startAtBar: 25.5, durationInBars: 1 },
    { noteName: 'E4', startAtBar: 27, durationInBars: 1 },
    { noteName: 'E4', startAtBar: 28.5, durationInBars: 1 },
  ],
};

const finalTechStack: SongData = {
  id: 3,
  name: 'The Final Tech Stack',
  bpm: 120,
  backingTracks: [
    {
      type: 'instrumental',
      url: '/final-tech-stack/the-final-tech-stack_instrumental.mp3',
      volume: 1,
    },
    {
      type: 'clicks',
      url: '/final-tech-stack/the-final-tech-stack_clicks.mp3',
      volume: 1,
    },
  ],
  notes: [
    { noteName: 'C#4', startAtBar: 0, durationInBars: 0.25 }, // 1
    { noteName: 'B3', startAtBar: 0.25, durationInBars: 0.25 }, // 1
    { noteName: 'C#4', startAtBar: 0.5, durationInBars: 1 }, // 2
    { noteName: 'F#3', startAtBar: 1.5, durationInBars: 1.5 }, // 4

    // GAP * 2

    { noteName: 'D4', startAtBar: 4, durationInBars: 0.25 }, // 1
    { noteName: 'C#4', startAtBar: 4.25, durationInBars: 0.25 }, // 1
    { noteName: 'D4', startAtBar: 4.5, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'C#4', startAtBar: 5, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'B3', startAtBar: 5.5, durationInBars: 1.25 }, // 4

    // GAP * 2

    { noteName: 'D4', startAtBar: 8, durationInBars: 0.25 }, // 1
    { noteName: 'C#4', startAtBar: 8.25, durationInBars: 0.25 }, // 1
    { noteName: 'D4', startAtBar: 8.5, durationInBars: 1 }, // 2
    { noteName: 'F#3', startAtBar: 9.5, durationInBars: 1.5 }, // 4

    // GAP * 2

    { noteName: 'B3', startAtBar: 12, durationInBars: 0.25 }, // 1
    { noteName: 'A3', startAtBar: 12.25, durationInBars: 0.25 }, // 1
    { noteName: 'B3', startAtBar: 12.5, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'A3', startAtBar: 13, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'G#3', startAtBar: 13.5, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'B3', startAtBar: 14, durationInBars: 0.25 }, // 1
    // GAP
    { noteName: 'A3', startAtBar: 14.5, durationInBars: 1.25 }, // 4

    // TODO: intro x2 !

    { noteName: 'G#3', startAtBar: 16, durationInBars: 0.25 }, // 1
    { noteName: 'A3', startAtBar: 16.25, durationInBars: 0.25 }, // 1
    { noteName: 'B3', startAtBar: 16.5, durationInBars: 1.25 }, // 4
    // GAP
    { noteName: 'A3', startAtBar: 18, durationInBars: 0.25 }, // 1
    { noteName: 'B3', startAtBar: 18.25, durationInBars: 0.25 }, // 1
    { noteName: 'C#4', startAtBar: 18.5, durationInBars: 0.5 }, // 1.5
    { noteName: 'B3', startAtBar: 19, durationInBars: 0.5 }, // 1.5
    { noteName: 'A3', startAtBar: 19.5, durationInBars: 0.5 }, // 1.5
    { noteName: 'G#3', startAtBar: 20, durationInBars: 0.5 }, // 1 / 1.5?
    { noteName: 'F#3', startAtBar: 20.5, durationInBars: 1 }, // 2
    { noteName: 'D4', startAtBar: 21.5, durationInBars: 1 }, // 2
    { noteName: 'C#4', startAtBar: 22.5, durationInBars: 2 }, // 4
    // GAP
    { noteName: 'C#4', startAtBar: 24.75, durationInBars: 0.5 }, // 1
    { noteName: 'D4', startAtBar: 25.25, durationInBars: 0.5 }, // 1
    { noteName: 'C#4', startAtBar: 25.75, durationInBars: 0.5 }, // 1
    { noteName: 'B3', startAtBar: 26.25, durationInBars: 0.5 }, // 1
    { noteName: 'C#4', startAtBar: 26.75, durationInBars: 3 }, // 4
  ].map((note) => ({ ...note, startAtBar: note.startAtBar + 1.5 })),
};

export const songs: SongData[] = [
  allNotesDemo,
  allNotesDemoReversed,
  ezSong,
  finalTechStack,
];
