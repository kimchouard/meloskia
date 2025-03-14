import { usePianoLayout } from "@/hooks/usePianoLayout";
import { FC } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { useKeyboard } from "../controller";
import {
  BLACK_KEY_POSITION_INDICES,
  PIANO_KEYS_BLACK,
  PIANO_KEYS_WHITE,
} from "../data";
import { PianoKey } from "./PianoKey";

type Props = {};

export const PianoKeyboard: FC<Props> = ({}) => {
  const {
    keyboardWidth,
    keyboardHeight,
    whiteKeyWidth,
    blackKeyWidth,
    gap,
    keyRadius,
    keyPaddingBottom,
  } = usePianoLayout();
  const { pushKeys, releaseKeys } = useKeyboard();

  const renderWhiteKeys = () => {
    return PIANO_KEYS_WHITE.map((key) => {
      return (
        <Animated.View
          key={key}
          style={{
            width: whiteKeyWidth,
            height: "100%",
          }}
        >
          <PianoKey
            type="white"
            keyName={key}
            activeColor={"red"}
            borderRadius={keyRadius}
            paddingBottom={keyPaddingBottom}
            onPressIn={pushKeys}
            onPressOut={releaseKeys}
          />
        </Animated.View>
      );
    });
  };

  const renderBlackKeys = () => {
    return PIANO_KEYS_BLACK.map((key) => {
      return (
        <Animated.View
          key={key}
          style={{
            position: "absolute",
            left:
              BLACK_KEY_POSITION_INDICES[key] * (whiteKeyWidth + gap) +
              whiteKeyWidth +
              gap,
            width: blackKeyWidth,
            height: "50%",
            transform: [
              {
                translateX: -blackKeyWidth / 2,
              },
            ],
          }}
        >
          <PianoKey
            type="black"
            keyName={key}
            activeColor={"red"}
            borderRadius={keyRadius}
            paddingBottom={keyPaddingBottom}
            onPressIn={pushKeys}
            onPressOut={releaseKeys}
          />
        </Animated.View>
      );
    });
  };

  return (
    <View
      style={{
        position: "absolute",
        width: keyboardWidth,
        height: keyboardHeight,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "black",
        paddingVertical: gap / 2,
        bottom: 0,
        gap,
      }}
    >
      {renderWhiteKeys()}
      {renderBlackKeys()}
    </View>
  );
};
