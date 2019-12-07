import { ShellGameScene } from '../scenes/ShellGameScene';
import { TablePositions } from './MotionPath';

export class Cup extends Phaser.GameObjects.PathFollower {
    public static init(texture: string, frame: string, shuffleSpeedMultiplier: number) {
        Cup._texture = texture;
        Cup._frame = frame;
        Cup._shuffleSpeedX = shuffleSpeedMultiplier;
    }
    public static create(scene: ShellGameScene, position: Phaser.Math.Vector2, tablePosition: number): Cup {
        let cup = new Cup(scene, scene.cupPaths[tablePosition].path, position.x, position.y, Cup._texture, Cup._frame);
        cup._tablePosition = tablePosition;
        cup.initInteraction();
        scene.add.existing(cup);
        return cup;
    }
    protected static _texture: string;
    protected static _frame: string;
    protected static _shuffleSpeedX: number;

    public scene: ShellGameScene;
    private _hasBall: boolean = false;
    private _tablePosition: TablePositions; // placement on table, 1-3
    private _isLifted: boolean = false;

    public getPlacement(): number {
        return this._tablePosition;
    }

    public hasBall(): boolean {
        return this._hasBall;
    }

    public setHasBall(value: boolean): void {
        this._hasBall = value;
    }

    public moveIntoScene(): void {
        for (let i = 0; i < this.scene.cupPaths.length; i++) {
            if (this.scene.cupPaths[i].from === TablePositions.OFFSCREEN && this.scene.cupPaths[i].to === this._tablePosition) {
                this.setPath(this.scene.cupPaths[i].path, {
                    positionOnPath: true,
                    duration: 750,
                    yoyo: false,
                    repeat: 0,
                    rotateToPath: false,
                    ease: 'Cubic.easeOut'
                });
                break;
            }
        }
    }

    public moveToPosition(toPosition: TablePositions, reverse: boolean = false, callback?: () => void) {
        let fromPosition = this._tablePosition;
        let speed = fromPosition + toPosition === 2 ? 1150 : 800; // if moving from 1 to 3 or 3 to 1, take longer
        speed *= Cup._shuffleSpeedX;
        console.log(speed);
        if (reverse) {
            fromPosition = toPosition;
            toPosition = this._tablePosition;
        }

        for (let i = 0; i < this.scene.cupPaths.length; i++) {
            if (this.scene.cupPaths[i].from === fromPosition && this.scene.cupPaths[i].to === toPosition) {
                this.setPath(this.scene.cupPaths[i].path, {
                    from: reverse ? 1 : 0,
                    to: reverse ? 0 : 1,
                    positionOnPath: true,
                    duration: speed,
                    yoyo: false,
                    repeat: 0,
                    rotateToPath: false,
                    ease: 'Cubic.easeInOut'
                });
                this._tablePosition = reverse ? fromPosition : toPosition;
                if (callback !== undefined) { this.pathTween.setCallback('onComplete', callback, [], this.scene); }
                break;
            }
        }
    }

    public lift(callback?: () => void): void {
        if (!this._isLifted) {
            this.anims.play('lift');
            this._isLifted = true;
            if (callback !== undefined) { this.once('animationcomplete', callback, this.scene); }
        } else {
            if (callback !== undefined) {
                callback();
            }
        }
    }

    public drop(callback?: () => void): void {
        if (this._isLifted) {
            this.anims.playReverse('lift');
            this._isLifted = false;
            if (callback !== undefined) { this.once('animationcomplete', callback, this.scene); }
        } else {
            if (callback !== undefined) {
                callback();
            }
        }
    }

    private initInteraction(): void {
        this.on('pointerdown', () => {
            this.scene.reveal(this._tablePosition);
        });
        this.on('pointerover', (pointer: Phaser.Input.Pointer) => {
            this.setTint(0x7878ff);
        });
        this.on('pointerout', (pointer: Phaser.Input.Pointer) => {
            this.clearTint();
        });
    }
}