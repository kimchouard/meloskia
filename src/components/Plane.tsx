import { PaintProps, Path, SkRect, Skia, TransformProps, Transforms3d, processTransform, processTransform3d } from "@shopify/react-native-skia";

interface PlaneProps extends PaintProps {
    x: number;
    y: number;
    width: number;
    height: number;
    transform: Transforms3d;
}

export const Plane = ({  x, y, width, height, transform, ...props }: PlaneProps) => {
    const path = Skia.Path.Make();
    path.addRect(Skia.XYWHRect(x, y, width, height));
    path.transform(processTransform3d(transform));
    return (
        <>
            <Path path={path} {...props} />
        </>
    );
};