export enum TablePositions {
    OFFSCREEN = -1,
    ONE,
    TWO,
    THREE,
    HIDDEN,
}

export interface MotionPathData {
    k_to: TablePositions;
    k_from: TablePositions;
    pathData: Phaser.Types.Curves.JSONCurve;
}

export class MotionPath {
    public from: number;
    public to: number;
    public path: Phaser.Curves.Curve;

    constructor(data: MotionPathData) {
        this.from = data.k_from;
        this.to = data.k_to;
        // this.path = new Phaser.Curves.Path();
        let pathData = data.pathData;
        this.makePath(pathData);
    }

    private makePath(pathData: Phaser.Types.Curves.JSONCurve) {
        switch (pathData.type) {
            case 'CubicBezier':
                // this.path.add(Phaser.Curves.CubicBezier.fromJSON(pathData));
                this.path = Phaser.Curves.CubicBezier.fromJSON(pathData);
                break;
            case 'Line':
                // this.path.add(Phaser.Curves.Line.fromJSON(pathData));
                this.path = Phaser.Curves.Line.fromJSON(pathData);
                break;
        }
    }
}