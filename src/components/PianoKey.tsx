import { FC } from "react";
import { Pressable, TextStyle, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { IPianoKey, IPianoKeys, useKeyboard } from "../controller";

type Props = {
  type: "black" | "white";
  keyName: IPianoKey;
  activeColor: string;
  borderRadius: number;
  paddingBottom: number;
  onPressIn: (...keyNames: IPianoKeys) => void;
  onPressOut: (...keyNames: IPianoKeys) => void;
};

export const PianoKey: FC<Props> = ({
  type,
  keyName,
  activeColor,
  onPressIn,
  onPressOut,
  borderRadius,
  paddingBottom,
}) => {
  const $style =
    type === "white"
      ? {
          ...$pianoKey,
          backgroundColor: "white",
          borderRadius,
          paddingBottom,
        }
      : {
          ...$pianoKey,
          backgroundColor: "black",
          borderRadius,
          paddingBottom,
        };
  const { activeKeys } = useKeyboard();
  const defaultColor = type === "white" ? "black" : "white";
  const textUas = useAnimatedStyle<TextStyle>(() => {
    return {
      color: activeKeys.value.includes(keyName) ? activeColor : defaultColor,
    };
  }, [activeKeys]);

  return (
    <Pressable
      onPressIn={() => {
        onPressIn(keyName);
      }}
      onPressOut={() => {
        onPressOut(keyName);
      }}
      style={$style}
    >
      <Animated.Text style={[$text, textUas]}>{keyName}</Animated.Text>
    </Pressable>
  );
};

const $pianoKey: ViewStyle = {
  justifyContent: "flex-end",
  alignItems: "center",
  width: "100%",
  height: "100%",
};

const $text: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  textAlign: "center",
};
