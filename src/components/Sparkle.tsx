import { random } from "@/utils/utils";
import { Group, SkRect, Transforms3d, vec } from "@shopify/react-native-skia";
import { FC, useMemo } from "react";
import {
  SharedValue,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import { Particle } from "./Particle";

type Props = {
  rect: SkRect;
  color: string;
  totalParticles: number;
  progress: SharedValue<number>;
};

export const Sparkle: FC<Props> = ({
  rect,
  color,
  totalParticles,
  progress,
}) => {
  const move = useMemo(() => vec(random(-100, 100), random(-200, 0)), []);
  const transform = useDerivedValue<Transforms3d>(() => {
    const x = interpolate(progress.value, [0, 1], [rect.x, rect.x + move.x]);
    const y = interpolate(progress.value, [0, 1], [rect.y, rect.y + move.y]);
    return [{ translate: [x, y] }];
  }, [move]);
  const opacity = useDerivedValue(() => {
    return interpolate(progress.value, [0, 1], [1, 0]);
  }, []);

  return (
    <Group transform={transform} opacity={opacity}>
      {new Array(totalParticles).fill(0).map((_, i) => {
        return (
          <Particle
            key={i}
            color={color}
            angle={((Math.PI * 2) / totalParticles) * i}
            progress={progress}
            length={60}
            thickness={4}
          />
        );
      })}
    </Group>
  );
};
