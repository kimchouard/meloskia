import ezSong from './ezSong';
import allNotesDemo from './allNotesDemo';
import theFinalTechStack from './theFinalTechStack';
import allNotesDemoReversed from './allNotesDemoReversed';
import type { Song } from './types';

export * from './types';

const songs: Song[] = [
  allNotesDemo,
  allNotesDemoReversed,
  ezSong,
  theFinalTechStack,
];

export default songs;
