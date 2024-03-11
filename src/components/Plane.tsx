import { Matrix4, PaintProps, Path, SkRect, Skia, TransformProps, Transforms3d, mapPoint3d, processTransform, processTransform3d } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

const addRect = (p: Skia.Path, rect: SkRect) => {

};

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
        const rct = Skia.XYWHRect(x, y, width, height);
        if (r > 0) {
            p.addRRect(Skia.RRectXY(rct, r, r));
        } else {
            p.addRect(rct);
        }
        p.transform(matrix.value)
        return p;
    });
    const cl = Skia.Color(color);
    cl[3] = opacity;
    return (
        <>
            <Path path={path} color={cl} {...props} />
        </>
    );
};