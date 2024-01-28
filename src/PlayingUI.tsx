import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
 
const HelloSkia = () => {
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const minSize = Math.min(width, height);
  const r = minSize * 0.33;

  console.log('SkiaUI.tsx: width: ', width, ' height: ', height, ' r: ', r, minSize)

  return (
    <Canvas style={{ width, height }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={minSize - r} cy={r} r={r} color="magenta" />
        <Circle cx={minSize / 2} cy={minSize - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};
 
export default HelloSkia;