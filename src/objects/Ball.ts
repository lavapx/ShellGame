import { ShellGameScene } from '../scenes/ShellGameScene';
import { TablePositions } from './MotionPath';

export class Ball extends Phaser.GameObjects.PathFollower {
    public static init(texture: string, frame: string) {
        Ball._texture = texture;
        Ball._frame = frame;
    }
    public static create(scene: Phaser.Scene, position: Phaser.Math.Vector2): Ball {
        let ball = new Ball(scene, position.x, position.y, Ball._texture, Ball._frame);
        ball.depth = -1;
        scene.add.existing(ball);
        return ball;
    }
    protected static _texture: string;
    protected static _frame: string;

    public scene: ShellGameScene;
    private _tablePosition: number = 0; // placement on table, 1-3
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, null, x, y, texture, frame );
    }

    public getPlacement(): number {
        return this._tablePosition;
    }

    public moveIntoScene(onComplete: () => void, context: any): void {
        for (let i = 0; i < this.scene.ballPaths.length; i++) {
            if (this.scene.ballPaths[i].from === TablePositions.OFFSCREEN) {
                this.setPath(this.scene.ballPaths[i].path, {
                    duration: 500,
                    ease: 'Cubic.easeOut',
                    positionOnPath: true,
                });
                this.pathTween.setCallback('onComplete', onComplete, [], context);
                break;
            }
        }
    }

    public moveAndHide(onComplete?: () => void, context?: any): void {
        for (let i = 0; i < this.scene.ballPaths.length; i++) {
            if (this.scene.ballPaths[i].from === this._tablePosition) {
                this.setPath(this.scene.ballPaths[i].path, {
                    from: 0,
                    to: 1,
                    startAt: 0,
                    positionOnPath: true,
                    duration: 550,
                    yoyo: false,
                    repeat: 0,
                    rotateToPath: false,
                    ease: 'Cubic.easeInOut',
                });
                if (onComplete !== undefined) { this.pathTween.setCallback('onComplete', onComplete, [], context); }
                break;
            }
        }
    }

    public moveAndShow(newPosition: number): void {
        this.visible = true;
        for (let i = 0; i < this.scene.ballPaths.length; i++) {
            if (this.scene.ballPaths[i].to === newPosition && this.scene.ballPaths[i].from === TablePositions.HIDDEN) {
                this.setPath(this.scene.ballPaths[i].path, {
                    from: 0,
                    to: 1,
                    startAt: 0,
                    positionOnPath: true,
                    duration: 550,
                    yoyo: false,
                    repeat: 0,
                    rotateToPath: false,
                    ease: 'Cubic.easeInOut'
                });
                this._tablePosition = newPosition;
                this.pathUpdate();
                this.pauseFollow();
                break;
            }
        }
    }

    public rollOut(): void {
        this.resumeFollow();
    }

}