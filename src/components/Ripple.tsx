import { colorToneDown } from "@/utils/utils";
import { Circle, Group, RadialGradient, vec } from "@shopify/react-native-skia";
import { FC } from "react";
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  isCollidedKeyboardTop: SharedValue<boolean>;
  cx: number;
  cy: number;
  radius: number;
  color: string;
};

export const Ripple: FC<Props> = ({
  isCollidedKeyboardTop,
  cx,
  cy,
  radius,
  color,
}) => {
  const r = useSharedValue<number>(0);
  const opacity = useSharedValue(0);

  const animate = () => {
    "worklet";

    opacity.value = 0.8;
    opacity.value = withTiming(0, { duration: 600 });
    r.value = radius / 2;
    r.value = withTiming(radius * 3, { duration: 700 });
  };

  useAnimatedReaction(
    () => isCollidedKeyboardTop.value,
    (isCollidedKeyboardTop) => {
      if (isCollidedKeyboardTop) {
        animate();
      }
    },
    []
  );

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
        <RadialGradient
          c={vec(cx, cy)}
          r={r}
          colors={[colorToneDown(color, 0.7), colorToneDown(color, 1.0)]}
        />
      </Circle>
    </Group>
  );
};
