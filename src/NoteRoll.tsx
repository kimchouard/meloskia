import {
  Group, Paint, Rect, RoundedRect,
} from '@shopify/react-native-skia';
import {
  Easing, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { memo, useEffect } from 'react';
import {
  gameWidth, gameHeight, pianoKeyboardHeight, screenHeight, bgColor, keyNoteColors,
} from './utils';
import { PlayMode } from './PlayingUI';

const noteHeight = 100;
const noteStrokeWidth = 8;

const NoteRoll = ({ playMode }:{ playMode: PlayMode }) => {
  const rollY = useSharedValue(0);
  const rollTransform = useDerivedValue(() => [{ translateY: rollY.value }]);

  useEffect(() => {
    if (playMode === 'playing') {
      rollY.value = withTiming(2.5 * screenHeight, {
        duration: 4000,
        easing: Easing.linear,
      });
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
    { translateY: -2 * gameHeight + pianoKeyboardHeight },
  ]}>
    <Rect x={0} y={0} width={gameWidth} height={2 * gameHeight - pianoKeyboardHeight} color={ bgColor } />

    {/* Create a line at the center of each piano key */}
    { [...Array(11)].map((_, i) => {
      const xPos = i * (gameWidth / 10);
      return <Rect key={`line_${i}`} x={xPos} y={0} width={1} height={2 * gameHeight - pianoKeyboardHeight} color={'#555'} />;
    }) }

    {/* Create a rounded rect representing a note for each white key */}
    <Group transform={rollTransform}>
      { [...Array(10)].map((_, i) => {
        const yBase = 1.5 * gameHeight - pianoKeyboardHeight;

        const xPos = i * (gameWidth / 10) + noteStrokeWidth / 2;
        const yPos = yBase - (i + 1) * (noteHeight + noteHeight / 2) + noteStrokeWidth / 2;

        return <RoundedRect key={`note_${i}`} x={xPos} y={yPos} width={gameWidth / 10 - noteStrokeWidth} height={noteHeight - noteStrokeWidth} r={5}>
          <Paint color={ keyNoteColors[i] } style="stroke" strokeWidth={noteStrokeWidth} opacity={0.5} />
          <Paint color={ keyNoteColors[i] } />
        </RoundedRect>;
      }) }
    </Group>
  </Group>;
};

export default memo(NoteRoll);
