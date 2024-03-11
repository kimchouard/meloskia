import { keyStrokeWidth } from "@/utils/utils";
import { Group, Matrix4, Path, Skia, mapPoint3d } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface PlaneProp {
    matrix: SharedValue<Matrix4>;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    opacity?: number;
    r?: number;
    stroke?: { opacity: number; width: number };
}

export const Plane = ({ matrix, x, y, width, height, color, opacity = 1, r=0, stroke }: PlaneProp) => {
    const path = useDerivedValue(() => {
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
        return p;
    });
    return (
        <>
            <Path path={path} color={color} opacity={opacity} />
            {/* {
                stroke && (
                    <Path path={path} style="stroke" opacity={stroke.opacity} strokeWidth={stroke.width} color={color} />
                )
            } */}
        </>
    );
}