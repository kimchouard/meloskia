import React, { memo, useMemo } from 'react';
import { RoundedRect, Paint } from '@shopify/react-native-skia';

import {
  keyWidth,
  gameWidth,
  gameHeight,
  countdownBars,
  keyNoteColors,
  getDistFromBars,
  pianoKeyboardHeight,
  accidentalNoteColors,
} from '@/utils/utils';
import { SongData, SongNote } from '@/utils/songs';
import {
  keyNames,
  accidentalNames,
  noteToKeyboardKey,
} from '@/components/PianoKeyboard';

interface NoteRollNotesProps {
  songData: SongData;
}

const NoteRollNotes: React.FC<NoteRollNotesProps> = (props) => {
  const { songData } = props;

  return (
    <>
      {songData.notes.map((note, i) => (
        <Note key={`${i}-${note.noteName}`} note={note} bpm={songData.bpm} />
      ))}
    </>
  );
};

export default memo(NoteRollNotes);

interface NoteProps {
  note: SongNote;
  bpm: number;
}

const noteStrokeWidth = 8;

const Note: React.FC<NoteProps> = (props) => {
  const { note, bpm } = props;

  const roundedRectParams = useMemo(() => {
    const yOfKeyboardHeight = gameHeight - pianoKeyboardHeight;

    // Get the index of the note in the keyNames array
    const keyboardKey = noteToKeyboardKey[note.noteName];

    const noteIndex = keyNames.indexOf(keyboardKey);
    const noteAccidentalIndex = accidentalNames.indexOf(keyboardKey);

    let x = 0;
    let width = 0;
    let color = '';

    const y =
      yOfKeyboardHeight -
      getDistFromBars(
        countdownBars + note.startAtBar + note.durationInBars,
        bpm
      ) +
      noteStrokeWidth / 2;

    if (noteIndex !== -1) {
      x = noteIndex * keyWidth + noteStrokeWidth / 2 + 15;
      width = keyWidth - noteStrokeWidth - 30;
      color = keyNoteColors[noteIndex];

      return { x, y, width, color };
    }

    x = (noteAccidentalIndex - 1 / 4) * keyWidth + noteStrokeWidth / 2 + 7.5;
    width = gameWidth / (10 * 2) - noteStrokeWidth - 15;
    color = accidentalNoteColors[noteAccidentalIndex - 1];

    return { x, y, width, color };
  }, [bpm]);

  return (
    <RoundedRect
      x={roundedRectParams.x}
      y={roundedRectParams.y}
      width={roundedRectParams.width}
      height={getDistFromBars(note.durationInBars, bpm) - noteStrokeWidth}
      r={5}>
      <Paint
        color={roundedRectParams.color}
        style="stroke"
        strokeWidth={noteStrokeWidth}
        opacity={0.5}
      />
      <Paint color={roundedRectParams.color} />
    </RoundedRect>
  );
};
