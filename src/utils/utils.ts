import { Dimensions } from 'react-native';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Gesture } from 'react-native-gesture-handler';
import { accidentalNames, keyNames } from '@/components/PianoKeyboard';
import { SongData } from './songs';

const verbose = false;

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
  '#BAE7FF',
  '#B5C7FF',
  '#C6B5FF',
  '#FFB5FF',
  '#FFB5B5',
  '#FFC8A2',
  '#FFEBAE',
  '#CFFFE5',
  // Restarting, next octave!
  '#BAE7FF',
  '#B5C7FF',
  '#C6B5FF',

  // Extra colors
  // '#FFB5FF',
  // '#FFB5D9',
  // '#FFB6B9',
];

export const accidentalNoteColors = [
  '#7ABDFF',
  '#6A8AFF',
  '#8A6AFF',
  '#FF7A7A',
  '#FFA94D',
  '#FFD747',
  '#9DFFB0',
  // Restarting, next octave!
  '#7ABDFF',
  '#6A8AFF',
  '#8A6AFF',

  // Extra colors
  // '#FF6AFF',
  // '#FF6ACD',
  // '#FF6A6A',
];

// ===========================
//   Styles / Tailwind
// ===========================

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// ===========================
//   Tempo and Time
// ===========================

export const isGamePlaying = (playMode) => playMode === 'playing' || playMode === 'playback';

// Countdown bars
export const countdownBars = 4;

// Distance between quarter lines & change ratio based on BPM
export const distanceBetweenBars = 100;
export const baseBPM = 80;
export const dynamicDistRatio = 0.2;

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

// Get the number of bars from the distance (px)
export const getBarsFromDist = (dist: number, BPM: number, options: { roundValue: true | false } = { roundValue: false }):number => {
  if (dist !== undefined && BPM !== undefined
  && dist !== null && BPM !== null) {
    const barsFromDist = dist / getDistFor1Bar(BPM);
    return (options.roundValue === true) ? Math.round(barsFromDist) : barsFromDist;
  }

  console.error('getBarsFromDist called with undefined or null arguments');
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

// Get the number of bars from the time (ms)
export const getBarsFromTime = (timeInMs: number, BPM: number, options: { roundValue: true | false } = { roundValue: false }):number => {
  if (timeInMs !== undefined && BPM !== undefined
  && timeInMs !== null && BPM !== null) {
    const barsFromTime = timeInMs / (60 / BPM) / 1000;
    return (options.roundValue === true) ? Math.round(barsFromTime) : barsFromTime;
  }

  console.error('getBarsFromTime called with undefined or null arguments');
};

export const getDurationInBars = (songData: SongData):number => {
  if (songData && songData.notes) {
    const lastNote = songData.notes[songData.notes.length - 1];
    return lastNote.startAtBar + lastNote.durationInBars;
  }

  return 0;
};

// ===========================
//   Expo Router
// ===========================

export const getNumberedUrlParams = (strindId: string):number => {
  // If the is is new, then we return a 'null' id
  if (strindId === 'new') return null;

  // If there is a songId
  if (strindId !== null && strindId !== undefined
  && typeof strindId === 'string') {
    // We try to convert it to a number
    const strindIdNumbered = parseInt(strindId, 10);
    verbose && console.log('Converting id: ', strindId, strindIdNumbered);

    // And we return it if it's a number
    if (typeof strindIdNumbered === 'number' && !Number.isNaN(strindIdNumbered)) {
      return strindIdNumbered;
    }
  }
};

// ==============================
//    Gesture Handler

const getKeyNameFromPosition = (x: number, y: number) => {
  const keyFloatIndex = (x - (screenWidth - gameWidth) / 2) / (gameWidth / 10);
  const keyIndex = Math.floor(keyFloatIndex);

  // Detect key accidentals
  if (y < gameHeight - pianoKeyboardHeight / 2) {
    // If we're on a black key, which are 1/4 of the width of a white key and inbetween white key 1 and 2, 2 and 3, 4 and 5, 5 and 6, 6 and 7, 8 and 9 and 9 and 10
    if ((keyFloatIndex > 0.73 && keyFloatIndex < 1.27) // W
      || (keyFloatIndex > 1.73 && keyFloatIndex < 2.27) // E
      || (keyFloatIndex > 3.73 && keyFloatIndex < 4.27) // T
      || (keyFloatIndex > 4.73 && keyFloatIndex < 5.27) // Y
      || (keyFloatIndex > 5.73 && keyFloatIndex < 6.27) // U
      || (keyFloatIndex > 7.73 && keyFloatIndex < 8.27) // O
      || (keyFloatIndex > 8.73 && keyFloatIndex < 9.27) // P
    ) {
      return accidentalNames[Math.round(keyFloatIndex)];
    }
  }

  // We're on a white key
  return keyNames[keyIndex];
};

export const getOnPressKeyboardGestureHandler = (keyPressed, releaseLastKey) => keyPressed && releaseLastKey && Gesture.Pan().minDistance(0)
  .onStart((e) => {
    // If the key is pressed on the keyboard
    if (e.y > gameHeight - pianoKeyboardHeight) {
      verbose && console.log('Key pressed:', e);

      keyPressed(getKeyNameFromPosition(e.x, e.y));
    }
  })
  .onChange((e) => {
    // If the key is pressed on the keyboard
    if (e.y > gameHeight - pianoKeyboardHeight) {
      const keyName = getKeyNameFromPosition(e.x, e.y);
      // If we're on an unknown key
      if (!keyName) return releaseLastKey();

      keyPressed(keyName, true);

      // If we've left the keyboard area
    } else {
      releaseLastKey();
    }
  })
  .onEnd(() => {
    releaseLastKey();
  });
