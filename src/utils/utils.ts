import { Dimensions } from 'react-native';

// ===========================
//   Dimensions & Placing
// ===========================

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

export const gameWidth = Dimensions.get('window').width * ((screenWidth > 1000) ? 0.5 : 0.9);
export const gameHeight = Dimensions.get('window').height;

export const pianoKeyboardHeight = 200;
export const keyStrokeWidth = 4;

export const numberOfWhiteKeys = 10;
export const keyWidth = gameWidth / numberOfWhiteKeys;

// ===========================
//   Colors
// ===========================

export const bgColor = '#101010';
export const blackKeyColor = '#202020';
export const whiteKeyColor = '#FEFEFE';

// Create an array of pastel colors for the 10 notes
export const keyNoteColors = [
  '#FFB6B9',
  '#FFC8A2',
  '#FFEBAE',
  '#CFFFE5',
  '#BAE7FF',
  '#B5C7FF',
  '#C6B5FF',
  '#FFB5FF',
  '#FFB5D9',
  '#FFB5B5',
];

export const accidentalNoteColors = [
  '#FF7A7A',
  '#FFA94D',
  '#FFD747',
  '#9DFFB0',
  '#7ABDFF',
  '#6A8AFF',
  '#8A6AFF',
  '#FF6AFF',
  '#FF6ACD',
  '#FF6A6A',
];

// ===========================
//   Tempo and Time
// ===========================

export const isGamePlaying = (playMode) => playMode === 'playing' || playMode === 'playback';

// Distance between quarter lines & change ratio based on BPM
export const distanceBetweenBars = 100;
export const baseBPM = 80;
export const dynamicDistRatio = 0.2;
export const countdownBars = 4;

// Get the dynamic distance for 1 bar: 75% fixed and 25% dynamic based on the BPM
// >> allows for a easier reading on fast BPM
export const getDistFor1Bar = (BPM: number):number => distanceBetweenBars * ((1 - dynamicDistRatio) + dynamicDistRatio * (baseBPM / BPM));

// Returns the X position (px) based on the number of bars
export const getDistFromBars = (barCount: number, BPM: number, options: { roundValue: true | false } = { roundValue: true }):number => {
  // Only return a value if the currentTime && BPM are passsed
  // console.log('getNoteXPositionBasedOnTime params: ', currentTime, BPM);
  if (barCount !== undefined && BPM !== undefined
  && barCount !== null && BPM !== null) {
    const distXFromBars = barCount * getDistFor1Bar(BPM);
    return (options.roundValue === true) ? Math.round(distXFromBars) : distXFromBars;
  }

  console.error('getDistXFromBars called with undefined or null arguments');
};

// Get time (ms) from the number of bars
export const getTimeFromBars = (barCount: number, BPM: number, options: { roundValue: true | false } = { roundValue: true }):number => {
  if (barCount !== undefined && BPM !== undefined
  && barCount !== null && BPM !== null) {
    const timeFromBars = barCount * (60 / BPM) * 1000;
    return (options.roundValue === true) ? Math.round(timeFromBars) : timeFromBars;
  }

  console.error('getTimeFromBars called with undefined or null arguments');
};
