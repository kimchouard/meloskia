import {
  Group, LinearGradient, Paint, Rect, RoundedRect, Text, useFont, vec,
} from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import colors from 'tailwindcss/colors';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { Easing } from 'react-native';
import {
  pianoKeyboardHeight, keyStrokeWidth, numberOfWhiteKeys, gameWidth, gameHeight, screenWidth, keyWidth, whiteKeyColor,
} from '../utils/utils';
import { KeysState } from '../hooks/useKeyboard';

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

export const noteToKeyboardKey = Object.fromEntries(Object.entries(keyboardKeyToNote).map(([k, v]) => [v, k]));

const PianoKeyboard = ({
  keysState,
  songName,
}:{
  keysState: KeysState,
  songName: string,
}) => {
  const noteNameFontSize = 25;
  const noteNameFont = useFont('Inter_600SemiBold.ttf', noteNameFontSize);

  const scrollInY = useSharedValue(pianoKeyboardHeight);
  const scrollInTransform = useDerivedValue(() => [{ translateY: scrollInY.value }]);

  useEffect(() => {
    scrollInY.value = withTiming(0, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    });

    return () => {
      scrollInY.value = pianoKeyboardHeight;
    };
  }, [songName]);

  return (
    <Group
      transform={scrollInTransform}
    >
      {/* BG */}
      <Rect x={-(screenWidth - gameWidth) / 2 } y={gameHeight - pianoKeyboardHeight - keyStrokeWidth / 2} width={screenWidth} height={pianoKeyboardHeight + keyStrokeWidth / 2} color={ colors.neutral[950] } />

      {/* Draw 11 White keys using a loop */}
      { [...Array(numberOfWhiteKeys)].map((_, i) => {
        const xPos = i * (gameWidth / numberOfWhiteKeys);
        const yPos = gameHeight - pianoKeyboardHeight;
        const keyName = keyNames[i];
        const keyState = keysState[keyName];

        const keyNumber = i % 7;
        const hasAnAccidentalBefore = keyNumber === 1 || keyNumber === 2 || keyNumber === 4 || keyNumber === 5 || keyNumber === 6;

        const accidentalName = accidentalNames[i];
        const accidentalState = keysState[accidentalName];

        return <Group key={`pianokey_${i}`}>
          {/* White Key */}
          <RoundedRect x={xPos} y={yPos} width={keyWidth} height={pianoKeyboardHeight} r={5}>
            <Paint color={ colors.neutral[950] } style="stroke" strokeWidth={keyStrokeWidth} />
            <LinearGradient
              start={vec(xPos, yPos)}
              end={vec(xPos, yPos + pianoKeyboardHeight)}
              colors={[whiteKeyColor, (keyState) ? '#BDBDBD' : '#EDEDED']}
            />
          </RoundedRect>

          {/* Accidental (if there's one) */}
          { hasAnAccidentalBefore && <RoundedRect x={xPos - keyWidth / 4} y={yPos} width={keyWidth / 2} height={pianoKeyboardHeight / 2} r={5}>
            <Paint color={ colors.neutral[950] } style="stroke" strokeWidth={keyStrokeWidth} />
            <LinearGradient
              start={vec(xPos, yPos)}
              end={vec(xPos, yPos + pianoKeyboardHeight)}
              colors={[colors.neutral[950], (accidentalState) ? '#222' : '#444']}
            />
          </RoundedRect> }

          {/* Draw the note names (white & black keys! 🎹) */}
          { (screenWidth > 600) && <Group>
            { hasAnAccidentalBefore && <Text x={xPos - noteNameFontSize / 2.5} y={gameHeight - pianoKeyboardHeight / 2 - noteNameFontSize / 2} text={accidentalName} font={noteNameFont} color={whiteKeyColor} /> }
            { <Text x={xPos + keyWidth / 2 - noteNameFontSize / 4} y={gameHeight - noteNameFontSize / 2} text={keyName} font={noteNameFont} /> }
          </Group>}
        </Group>;
      }) }
    </Group>
  );
};

export default memo(PianoKeyboard);
