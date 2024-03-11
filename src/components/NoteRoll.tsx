import {
  Group,  multiply4,  processTransform3d, translate,
} from '@shopify/react-native-skia';
import {
  Easing, SharedValue, useDerivedValue, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import React, { memo, useEffect } from 'react';
import colors from 'tailwindcss/colors';
import {
  gameWidth, gameHeight, pianoKeyboardHeight, countdownBars, getDistFromBars, getTimeFromBars, keyWidth, keyNoteColors, accidentalNoteColors, isGamePlaying, getDurationInBars,
} from '../utils/utils';
import { KeysState } from '../hooks/useKeyboard';
import { accidentalNames, keyNames, noteToKeyboardKey } from './PianoKeyboard';
import { SongData } from '@/utils/songs';
import { Plane } from './Plane';

const noteStrokeWidth = 8;

const NoteRoll = ({
  keysState,
  songData,
  noteRollY,
}:{
  keysState: KeysState,
  songData: SongData
  noteRollY: SharedValue<number>,
}) => {

  const perspectiveRollIn = useSharedValue(0);
  const matrix = useDerivedValue(() => {
    return processTransform3d([
      { translateX: gameWidth / 2 },
      { translateY: gameHeight - pianoKeyboardHeight },

      // Apply the perspective effect
      { perspective: perspectiveRollIn.value },
      { rotateX: Math.PI / 10 },

      // Go back to the top of the screen
      { translateX: -gameWidth / 2 },
      { translateY: -gameHeight + pianoKeyboardHeight },
    ]);
  });
  const translatedMatrix = useDerivedValue(() => {
    return multiply4(matrix.value, translate(0, noteRollY.value));
  });

  useEffect(() => {
    perspectiveRollIn.value = 0;
    perspectiveRollIn.value = withDelay(250, withTiming(400, {
      duration: 750,
      easing: Easing.inOut(Easing.ease),
    }));

    return () => {
      perspectiveRollIn.value = 0;
    };
  }, [songData.name]);

  return <Group>
    {/* Create a line at the center of each piano key black key and a colored bg if need be ! */}
    { keysState && [...Array(11)].map((_, i) => {
      const xPos = i * (keyWidth);

      const keyPressed = keysState[keyNames[i]];
      const accidentalPressed = keysState[accidentalNames[i]];

      // Highlight the lines with a black key (accidental)
      const defaultAccidentalColor = (i === 10 || accidentalNames[i] === '') ? '#333' : '#666';

      const yPos = -2 * gameHeight;
      const height = 4 * gameHeight;

      return <Group key={`lines_${i}`}>
        {/* BG */}
        { (i < 10) && <Plane key={`bg_${i}`} matrix={matrix} x={xPos} y={yPos} width={keyWidth} height={height} color={ (keyPressed) ? keyNoteColors[i] : colors.neutral[950] } opacity={ (keyPressed) ? 0.1 : 1} /> }

        {/* Lines */}
        <Plane key={`line_${i}`} x={xPos} y={yPos} matrix={matrix}  width={(accidentalPressed) ? 2 : 1} height={height} color={(accidentalPressed) ? accidentalNoteColors[i - 1] : defaultAccidentalColor} />

      </Group>;
    }) }

    {/* Draw the notes for each key (black & white 🎹) */}
    <Group>
      { songData?.notes?.map((note, i) => {
        if (note.noteName) {
          const yOfKeyboardHeight = gameHeight - pianoKeyboardHeight;

          // Get the index of the note in the keyNames array
          const keyboardKey = noteToKeyboardKey[note.noteName];
          const noteIndex = keyNames.indexOf(keyboardKey);
          const noteAccidentalIndex = accidentalNames.indexOf(keyboardKey);

          const roundedRectParams:{
            xPos?: number,
            yPos?: number,
            width?: number,
            color?: string,
          } = {
            yPos: yOfKeyboardHeight - getDistFromBars(countdownBars + note.startAtBar + note.durationInBars, songData.bpm) + noteStrokeWidth / 2,
          };

          if (noteIndex !== -1) {
            roundedRectParams.xPos = noteIndex * keyWidth + noteStrokeWidth / 2;
            roundedRectParams.width = keyWidth - noteStrokeWidth;
            roundedRectParams.color = keyNoteColors[noteIndex];
          } else if (noteAccidentalIndex !== -1) {
            roundedRectParams.xPos = (noteAccidentalIndex - 1 / 4) * keyWidth + noteStrokeWidth / 2;
            roundedRectParams.width = gameWidth / (10 * 2) - noteStrokeWidth;
            roundedRectParams.color = accidentalNoteColors[noteAccidentalIndex - 1];
          } else {
            console.error('Uknown note:', note.noteName, note);
            return <></>;
          }

          return (
            <React.Fragment key={`note_${i}`}>
              <Plane
                matrix={translatedMatrix}
                x={roundedRectParams.xPos}
                y={roundedRectParams.yPos}
                width={roundedRectParams.width}
                height={getDistFromBars(note.durationInBars, songData.bpm) - noteStrokeWidth}
                r={5}
                color={ roundedRectParams.color }
              />
              <Plane
                matrix={translatedMatrix}
                x={roundedRectParams.xPos}
                y={roundedRectParams.yPos}
                width={roundedRectParams.width}
                height={getDistFromBars(note.durationInBars, songData.bpm) - noteStrokeWidth}
                r={5}
                color={ roundedRectParams.color } style="stroke" strokeWidth={noteStrokeWidth} opacity={0.5}
              />
            </React.Fragment>
          );
        }

        // ELSE: no noteName, so it's a rest
        return <></>;
      }) }
    </Group>
  </Group>;
};

export default memo(NoteRoll);
