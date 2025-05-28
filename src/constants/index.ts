export const keyNames = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'];
export const accidentalNames = ['', 'W', 'E', '', 'T', 'Y', 'U', '', 'O', 'P'];

export const keyboardKeyToNote = {
  A: 'C3',
  W: 'C#3',
  S: 'D3',
  E: 'D#3',
  D: 'E3',
  F: 'F3',
  T: 'F#3',
  G: 'G3',
  Y: 'G#3',
  H: 'A3',
  U: 'A#3',
  J: 'B3',
  K: 'C4',
  O: 'C#4',
  L: 'D4',
  P: 'D#4',
  ';': 'E4',
};

export const noteToKeyboardKey = Object.fromEntries(
  Object.entries(keyboardKeyToNote).map(([k, v]) => [v, k])
);
