import {
  Group, Paint, Rect, RoundedRect,
} from '@shopify/react-native-skia';
import {
  Easing, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { memo, useEffect } from 'react';
import colors from 'tailwindcss/colors';
import {
  gameWidth, gameHeight, pianoKeyboardHeight, countdownBars, getDistFromBars, getTimeFromBars, keyWidth, keyNoteColors, accidentalNoteColors, isGamePlaying,
} from '../utils/utils';
import { KeysState } from '../hooks/useKeyboard';
import { accidentalNames, keyNames, noteToKeyboardKey } from './PianoKeyboard';
import { PlayMode } from './PlayingUI';
import { SongData } from '@/utils/songs';

const noteStrokeWidth = 8;

const NoteRoll = ({
  playMode,
  keysState,
  songData,
}:{
  playMode: PlayMode,
  keysState: KeysState,
  songData: SongData
}) => {
  const rollY = useSharedValue(0);
  const rollTransform = useDerivedValue(() => [{ translateY: rollY.value }]);

  useEffect(() => {
    if (isGamePlaying(playMode)) {
      rollY.value = withTiming(
        getDistFromBars(songData.durationInBars + countdownBars, songData.bpm),
        {
          duration: getTimeFromBars(songData.durationInBars + countdownBars, songData.bpm),
          easing: Easing.linear,
        },
      );
    } else if (playMode === 'start') {
      rollY.value = withTiming(0, {
        duration: 500,
      });
    }
  }, [rollY, playMode]);

  return <Group transform={[
    // Go to the top of the piano keys, horizontally centered
    { translateX: gameWidth / 2 },
    { translateY: gameHeight - pianoKeyboardHeight },

    // Apply the perspective effect
    { perspective: 400 },
    { rotateX: Math.PI / 10 },

    // Go back to the top of the screen
    { translateX: -gameWidth / 2 },
    { translateY: -gameHeight + pianoKeyboardHeight },
  ]}>
    {/* Create a line at the center of each piano key black key and a colored bg if need be ! */}
    { [...Array(11)].map((_, i) => {
      const xPos = i * (keyWidth);

      const keyPressed = keysState[keyNames[i]];
      const accidentalPressed = keysState[accidentalNames[i]];

      // Highlight the lines with a black key (accidental)
      const defaultAccidentalColor = (i === 10 || accidentalNames[i] === '') ? '#333' : '#666';

      const yPos = -2 * gameHeight;
      const height = 4 * gameHeight;

      return <Group key={`lines_${i}`}>
        {/* BG */}
        { (i < 10) && <Rect key={`bg_${i}`} x={xPos} y={yPos} width={keyWidth} height={height} color={ (keyPressed) ? keyNoteColors[i] : colors.neutral[950] } opacity={ (keyPressed) ? 0.1 : 1} /> }

        {/* Lines */}
        <Rect key={`line_${i}`} x={xPos} y={yPos} width={(accidentalPressed) ? 2 : 1} height={height} color={(accidentalPressed) ? accidentalNoteColors[i] : defaultAccidentalColor} />

      </Group>;
    }) }

    {/* Create a rounded rect representing a note for each white key */}
    <Group transform={rollTransform}>
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
            roundedRectParams.color = accidentalNoteColors[noteAccidentalIndex];
          } else {
            console.error('Uknown note:', note.noteName, note);
            return <></>;
          }

          return <RoundedRect
            key={`note_${i}`}
            x={roundedRectParams.xPos}
            y={roundedRectParams.yPos}
            width={roundedRectParams.width}
            height={getDistFromBars(note.durationInBars, songData.bpm) - noteStrokeWidth}
            r={5}
          >
            <Paint color={ roundedRectParams.color } style="stroke" strokeWidth={noteStrokeWidth} opacity={0.5} />
            <Paint color={ roundedRectParams.color } />
          </RoundedRect>;
        }

        // ELSE: no noteName, so it's a rest
        return <></>;
      }) }
    </Group>
  </Group>;
};

export default memo(NoteRoll);
