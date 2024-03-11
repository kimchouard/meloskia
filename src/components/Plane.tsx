import { Matrix4, PaintProps, Path, SkRect, Skia, TransformProps, Transforms3d, mapPoint3d, processTransform, processTransform3d } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface PlaneProps extends PaintProps {
    x: number;
    y: number;
    width: number;
    height: number;
    matrix: SharedValue<Matrix4>;
    r?: number;
}

export const Plane = ({ x, y, width, height, matrix, r = 0, color, opacity, ...props }: PlaneProps) => {
    const path = useDerivedValue(() => {
        const p = Skia.Path.Make();
        const topLeft = mapPoint3d(matrix.value, [x, y, 0]);
        const topRight = mapPoint3d(matrix.value, [x + width, y, 0]);
        const bottomRight = mapPoint3d(matrix.value, [x + width, y + height, 0]);
        const bottomLeft = mapPoint3d(matrix.value, [x, y + height, 0]);
        // TODO: use p.transform instead
        p.moveTo(topLeft[0], topLeft[1]);
        p.lineTo(topRight[0], topRight[1]);
        p.lineTo(bottomRight[0], bottomRight[1]);
        p.lineTo(bottomLeft[0], bottomLeft[1]);
        p.close();
        return p;
    });
    const cl = Skia.Color(color);
    cl[3] = opacity;
    return (
        <>
            <Path path={path} color={cl} />
        </>
    );
};