import { Group, Paint, Rect, RoundedRect, Skia } from "@shopify/react-native-skia";
import { blackKeyColor, gameWidth, gameHeight, pianoKeyboardHeight, screenWidth, screenHeight, bgColor, keyNoteColors } from "./utils";

const noteHeight = 100;
const noteStrokeWidth = 8;

const NoteRoll = () => {
  return <Group transform={[
    // Go to the top of the piano keys, horizontally centered
    { translateX: gameWidth / 2 },
    { translateY: gameHeight - pianoKeyboardHeight },

    // Apply the perspective effect
    { perspective: 600 },
    { rotateX: Math.PI / 10},

    // Go back to the top of the screen
    { translateX: -gameWidth / 2 },
    { translateY: - 2 * gameHeight + pianoKeyboardHeight },
  ]}>
    <Rect x={0} y={0} width={gameWidth} height={2 * gameHeight - pianoKeyboardHeight} color={ bgColor } />

    {/* Create a line at the center of each piano key */}
    { [...Array(11)].map((_, i) => {
      const xPos = i * gameWidth / 10;
      return <Rect key={`line_${i}`} x={xPos} y={0} width={1} height={2 * gameHeight - pianoKeyboardHeight} color={'#555'} />;
    }) }

    {/* Create a rounded rect representing a note for each white key */}
    { [...Array(10)].map((_, i) => {
      const yBase = 1.5 * gameHeight - pianoKeyboardHeight;

      const xPos = i * gameWidth / 10 + noteStrokeWidth / 2;
      const yPos = yBase - (i + 1) * noteHeight + noteStrokeWidth / 2;

      return <RoundedRect key={`note_${i}`} x={xPos} y={yPos} width={gameWidth / 10 - noteStrokeWidth} height={noteHeight - noteStrokeWidth} r={5}>
        <Paint color={ keyNoteColors[i]  } style="stroke" strokeWidth={noteStrokeWidth} opacity={0.5} />
        <Paint color={ keyNoteColors[i] } />
      </RoundedRect>;
    }) }
  </Group>;
};

export default NoteRoll;