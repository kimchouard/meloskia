import { Dimensions } from 'react-native';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

export const gameWidth = Dimensions.get('window').width * ((screenWidth > 1000) ? 0.5 : 0.9);
export const gameHeight = Dimensions.get('window').height;

export const bgColor = '#101010';
export const blackKeyColor = '#202020';
export const whiteKeyColor = '#FEFEFE';

export const pianoKeyboardHeight = 200;
export const keyStrokeWidth = 4;

export const numberOfWhiteKeys = 10;

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
