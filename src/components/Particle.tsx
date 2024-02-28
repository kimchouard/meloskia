import { colorToneDown } from "@/utils/utils";
import {
  Group,
  Oval,
  Skia,
  TileMode,
  Transforms3d,
  rect,
  vec,
} from "@shopify/react-native-skia";
import { FC } from "react";
import {
  SharedValue,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";

type Props = {
  color: string;
  angle: number;
  progress: SharedValue<number>;
  length: number;
  thickness: number;
};

export const Particle: FC<Props> = ({
  color,
  angle,
  progress,
  length,
  thickness,
}) => {
  const data = useDerivedValue(() => {
    return {
      dist: interpolate(progress.value, [0, 0.3, 1], [0, 0, length]),
      length: interpolate(progress.value, [0, 1], [0, length]),
      thickness: interpolate(progress.value, [0, 1], [thickness, 0]),
      alpha: interpolate(progress.value, [0, 0.001, 1], [0, 1, 0.3]),
    };
  }, [length, thickness, progress]);

  const transform = useDerivedValue<Transforms3d>(() => {
    const { dist, thickness } = data.value;

    return [
      { translate: [0, thickness / 2] },
      { rotate: angle },
      { translate: [0, -thickness / 2] },
      { translateX: dist },
    ];
  }, []);

  const ovalRect = useDerivedValue(() => {
    const { dist, length, thickness } = data.value;
    return rect(0, 0, length - dist / 2, thickness);
  }, []);

  const gradientColors = [
    Skia.Color("white"),
    Skia.Color("white"),
    Skia.Color(color),
    Skia.Color(colorToneDown(color, 0.9)),
    Skia.Color(colorToneDown(color, 0.5)),
  ];
  const p = Skia.Paint();
  const paint = useDerivedValue(() => {
    const { dist, length, thickness, alpha } = data.value;
    const shader = Skia.Shader.MakeLinearGradient(
      vec(0, thickness / 2),
      vec(length - dist, thickness / 2),
      gradientColors,
      null,
      TileMode.Decal
    );
    p.setShader(shader);
    p.setAlphaf(alpha);
    return p;
  }, []);

  return (
    <Group transform={transform}>
      <Oval rect={ovalRect} paint={paint} />
    </Group>
  );
};
