// @refresh reset
import { usePianoLayout } from "@/hooks/usePianoLayout";
import { SongData } from "@/utils/songs";
import { countdownBars, getDistFromBars } from "@/utils/utils";
import {
  Canvas,
  Group,
  Transforms3d,
  rect,
  rrect,
  vec,
} from "@shopify/react-native-skia";
import { FC, useEffect, useMemo } from "react";
import {
  Gesture,
  GestureDetector,
  PanGesture,
} from "react-native-gesture-handler";
import {
  Easing,
  runOnUI,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useKeyboard } from "../controller";
import {
  BLACK_KEY_POSITION_INDICES,
  KEYS_MAPPING_BY_NOTES,
  PIANO_KEYS_BLACK,
  PIANO_KEYS_WHITE,
} from "../data";
import { Note } from "./Note";
import { NoteStreamLine } from "./NoteSteamLine";
import { NoteStreamLineBackground } from "./NoteSteamLineBackground";

type Props = {
  songData: SongData;
};

export const NoteStream: FC<Props> = ({ songData }) => {
  const {
    noteStreamWidth,
    noteStreamHeight,
    noteOutlineWidth,
    noteRadius,
    keyboardTop,
    whiteKeyWidth,
    blackKeyWidth,
    gap,
    lineWidth,
  } = usePianoLayout();
  const { activeKeys } = useKeyboard();

  // * Container
  const perspective = useSharedValue(0);
  const angle = Math.PI / 10;
  const containerTransform3D = useDerivedValue<Transforms3d>(() => {
    return [
      { translate: [noteStreamWidth / 2, noteStreamHeight] },
      { perspective: perspective.value },
      { rotateX: angle },
      { translate: [-noteStreamWidth / 2, -noteStreamHeight] },
    ];
  }, [noteStreamWidth, noteStreamHeight]);

  // * Notes
  const streamContentOffsetY = useSharedValue<number>(0);

  const pan = useMemo<PanGesture>(() => {
    return Gesture.Pan().onChange(({ changeY }) => {
      streamContentOffsetY.value += changeY * 4;
    });
  }, [streamContentOffsetY]);

  // * Entering animation
  useEffect(() => {
    const startGame = () => {
      "worklet";

      streamContentOffsetY.value = withDelay(
        500,
        withTiming(noteStreamHeight * 4, {
          duration: 4000,
          easing: Easing.linear,
        })
      );
    };
    const unfoldIn = () => {
      "worklet";

      perspective.value = 0;
      perspective.value = withDelay(
        250,
        withTiming(
          400,
          { duration: 750, easing: Easing.inOut(Easing.ease) },
          (finished) => {
            if (finished) {
              startGame();
            }
          }
        )
      );
    };

    runOnUI(unfoldIn)();
  }, []);

  return (
    <GestureDetector gesture={pan}>
      <Canvas
        style={{
          width: noteStreamWidth,
          height: noteStreamHeight,
        }}
      >
        <Group key={"Container"} transform={containerTransform3D}>
          <Group key={"LineBackground"}>
            {PIANO_KEYS_WHITE.map((keyName, i) => {
              return (
                <NoteStreamLineBackground
                  key={`LineBackground-${i}`}
                  rect={rect(
                    i * (whiteKeyWidth + gap) + lineWidth,
                    keyboardTop / 2,
                    whiteKeyWidth,
                    keyboardTop
                  )}
                  targetKeyName={keyName}
                  activeKeys={activeKeys}
                  color={"transparent"}
                  activeColor={"red"}
                />
              );
            })}
          </Group>
          <Group key={"Line"}>
            {[...Array(PIANO_KEYS_WHITE.length + 1)].map((_, i) => {
              const x1 = i * (whiteKeyWidth + gap);
              const y1 = -noteStreamHeight * 2;
              const x2 = x1;
              const y2 = noteStreamHeight;
              const targetKeyInfo = Object.entries(
                BLACK_KEY_POSITION_INDICES
              ).find(([, index]) => +index === i - 1) as
                | [(typeof PIANO_KEYS_BLACK)[number], number]
                | undefined;
              const targetKeyName = targetKeyInfo
                ? targetKeyInfo[0]
                : undefined;

              return (
                <NoteStreamLine
                  key={`Line-${i}`}
                  targetKeyName={targetKeyName}
                  activeKeys={activeKeys}
                  p1={vec(x1, y1)}
                  p2={vec(x2, y2)}
                  color={"gray"}
                  activeColor={"red"}
                  lineWidth={lineWidth}
                />
              );
            })}
          </Group>
          <Group key={"Notes"}>
            {songData.notes.map((note, i) => {
              const keyName = KEYS_MAPPING_BY_NOTES[note.noteName];
              if (
                PIANO_KEYS_WHITE.includes(
                  keyName as (typeof PIANO_KEYS_WHITE)[number]
                )
              ) {
                const keyIndex = PIANO_KEYS_WHITE.indexOf(
                  keyName as (typeof PIANO_KEYS_WHITE)[number]
                );
                const innerBlockWidth = whiteKeyWidth - noteOutlineWidth;
                const offsetX = keyIndex * (whiteKeyWidth + gap);
                const tx = (whiteKeyWidth - innerBlockWidth) / 2;
                const x = gap - lineWidth + offsetX + tx;
                const y =
                  keyboardTop -
                  getDistFromBars(
                    countdownBars + note.startAtBar + note.durationInBars,
                    songData.bpm
                  ) +
                  noteOutlineWidth / 2;
                const height =
                  getDistFromBars(note.durationInBars, songData.bpm) -
                  noteOutlineWidth;
                return (
                  <Note
                    key={`Notes-${i}`}
                    keyIndex={keyIndex}
                    stageWidth={noteStreamWidth}
                    stageHeight={noteStreamHeight}
                    rrectOrigin={rrect(
                      rect(x, y, innerBlockWidth, height),
                      noteRadius,
                      noteRadius
                    )}
                    noteOutlineWidth={noteOutlineWidth}
                    streamContentOffsetY={streamContentOffsetY}
                    keyboardTop={keyboardTop}
                  />
                );
              } else {
                const keyIndex =
                  BLACK_KEY_POSITION_INDICES[
                    keyName as (typeof PIANO_KEYS_BLACK)[number]
                  ];
                const innerBlockWidth = blackKeyWidth - noteOutlineWidth;
                const offsetX = (keyIndex + 1) * (whiteKeyWidth + gap);
                const tx = (whiteKeyWidth - innerBlockWidth) / 2;
                const x = gap - lineWidth + offsetX - tx;
                const y =
                  keyboardTop -
                  getDistFromBars(
                    countdownBars + note.startAtBar + note.durationInBars,
                    songData.bpm
                  ) +
                  noteOutlineWidth / 2;
                const height =
                  getDistFromBars(note.durationInBars, songData.bpm) -
                  noteOutlineWidth;
                return (
                  <Note
                    key={`Notes-${i}`}
                    keyIndex={keyIndex}
                    stageWidth={noteStreamWidth}
                    stageHeight={noteStreamHeight}
                    rrectOrigin={rrect(
                      rect(x, y, innerBlockWidth, height),
                      noteRadius,
                      noteRadius
                    )}
                    noteOutlineWidth={noteOutlineWidth}
                    streamContentOffsetY={streamContentOffsetY}
                    keyboardTop={keyboardTop}
                  />
                );
              }
            })}
          </Group>
        </Group>
      </Canvas>
    </GestureDetector>
  );
};
