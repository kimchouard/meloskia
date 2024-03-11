import { Matrix4, PaintProps, Path, SkRect, Skia, TransformProps, Transforms3d, mapPoint3d, processTransform, processTransform3d } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";

interface PlaneProps extends PaintProps {
    x: number;
    y: number;
    width: number;
    height: number;
    matrix: SharedValue<Matrix4>;
}

export const Plane = ({  x, y, width, height, matrix, ...props }: PlaneProps) => {
    const path = Skia.Path.Make();
    const p = Skia.Path.Make();
    const topLeft = mapPoint3d(matrix.value, [x, y, 0]);
    const topRight = mapPoint3d(matrix.value, [x + width, y, 0]);
    const bottomRight = mapPoint3d(matrix.value, [x + width, y + height, 0]);
    const bottomLeft = mapPoint3d(matrix.value, [x, y + height, 0]);
    p.moveTo(topLeft[0], topLeft[1]);
    p.lineTo(topRight[0], topRight[1]);
    p.lineTo(bottomRight[0], bottomRight[1]);
    p.lineTo(bottomLeft[0], bottomLeft[1]);
    p.close();
    return (
        <>
            <Path path={path} {...props} />
        </>
    );
};