export const PIANO_KEYS_WHITE = [
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ";",
] as const;
export const PIANO_KEYS_BLACK = ["W", "E", "T", "Y", "U", "O", "P"] as const;
export const PIANO_KEYS_ALL = [
  ...PIANO_KEYS_WHITE,
  ...PIANO_KEYS_BLACK,
] as const;
export const NOTES = [
  "C3",
  "C#3",
  "D3",
  "D#3",
  "E3",
  "F3",
  "F#3",
  "G3",
  "G#3",
  "A3",
  "A#3",
  "B3",
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
] as const;

export const NOTES_MAPPING_BY_KEYS = {
  A: "C3",
  W: "C#3",
  S: "D3",
  E: "D#3",
  D: "E3",
  F: "F3",
  T: "F#3",
  G: "G3",
  Y: "G#3",
  H: "A3",
  U: "A#3",
  J: "B3",
  K: "C4",
  O: "C#4",
  L: "D4",
  P: "D#4",
  ";": "E4",
} as const;

export const KEYS_MAPPING_BY_NOTES = Object.fromEntries(
  Object.entries(NOTES_MAPPING_BY_KEYS).map(([key, note]) => [note, key])
);

export const BLACK_KEY_POSITION_INDICES: {
  [K in (typeof PIANO_KEYS_BLACK)[number]]: number;
} = {
  W: 0,
  E: 1,
  T: 3,
  Y: 4,
  U: 5,
  O: 7,
  P: 8,
};
