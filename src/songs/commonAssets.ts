import { SongAsset } from './types';

const metronomeAssets: SongAsset[] = [
  {
    id: 'metronome-01',
    url: '/audio/metronome/click_high.wav',
    name: 'Metronome High',
    noteName: 'G5',
    type: 'note',
  },
  {
    id: 'metronome-02',
    url: '/audio/metronome/click_low.wav',
    name: 'Metronome Low',
    noteName: 'G4',
    type: 'note',
  },
];

const pianoAssets: SongAsset[] = [];

const drumAssets: SongAsset[] = [];

export default [...metronomeAssets, ...pianoAssets, ...drumAssets];
