import { MotionPath } from '../objects/MotionPath';
import { MenuButton } from '../ui/MenuButton';
import { Ball } from './../objects/Ball';
import { Cup } from './../objects/Cup';

enum GameState {
    SETUP,
    BEGIN, // hide ball
    BEGINNING,
    SHUFFLE,
    SHUFFLING,
    PICK_ENABLE, // allow input
    PICK_AWAIT, // show where ball is
    REPLAY_ENABLE, // enable replay button
    REPLAY_AWAIT, // reset game and go to begin
}

export class ShellGameScene extends Phaser.Scene {
    private static sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
        key: 'ShellGame',
        active: false,
        visible: false,
    };
    public cupPaths: Array<MotionPath>;
    public ballPaths: Array<MotionPath>;
    private _cupAnimationConfig: Phaser.Types.Animations.Animation;
    private _cups: Array<Cup>;
    private _cupStartPositions: Map<number, Phaser.Math.Vector2> = new Map([
        [0, new Phaser.Math.Vector2(200, -150)],
        [1, new Phaser.Math.Vector2(400, -150)],
        [2, new Phaser.Math.Vector2(600, -150)],
    ]);
    private _ball: Ball;
    private _ballStartPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-50, 350);

    private _state: GameState;
    private _shuffleItterations: number = 0;
    private _shuffleMultiplier: number;
    private _speedMultiplier: number;
    private _difficulty: number;

    private _descText: Phaser.GameObjects.BitmapText;
    private _winStrings: Map<number, string> = new Map([
        [0, 'Winner, winner, chicken dinner!'],
        [1, 'Yo Adrian, we did it!'],
        [2, 'You\'re the best around!'],
        [3, 'Way to go!'],
        [4, 'You\'ve got the fastest eyes in the West!'],
        [5, 'Mom would be proud!'],
        [6, 'Boom goes the dynamite!'],
    ]);
    private _winsText: Phaser.GameObjects.BitmapText;
    private _lossesText: Phaser.GameObjects.BitmapText;
    private _wins: number;
    private _losses: number;

    private _replayButton: Phaser.GameObjects.Sprite;

    constructor() {
        super(ShellGameScene.sceneConfig);
    }

    public init(data: any): void {
        console.log('init');
        // -- INIT DEBUG DRAW GRAPHICS OBJ
        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);

        // -- INIT MOTION PATHS
        let motionData = this.cache.json.get('motionPaths');
        this.cupPaths = new Array<MotionPath>();

        for (let i = 0; i < motionData.cupMotion.length; i++) {
            console.log(motionData.cupMotion[i]);
            this.cupPaths.push(new MotionPath(motionData.cupMotion[i]));
            // this.cupPaths[i].path.draw(graphics);
        }

        this.ballPaths = new Array<MotionPath>();
        for (let i = 0; i < motionData.ballMotion.length; i++) {
            console.log(motionData.ballMotion[i]);
            this.ballPaths.push(new MotionPath(motionData.ballMotion[i]));
            // this.ballPaths[i].path.draw(graphics);
        }

        switch (data.difficulty) {
            case 1:
                this._shuffleMultiplier = .5;
                this._speedMultiplier = 1.25;
                this._difficulty = 1;
                break;
            case 2:
                this._shuffleMultiplier = 1;
                this._speedMultiplier = 1;
                this._difficulty = 1;
                break;
            case 3:
                this._shuffleMultiplier = 1.2;
                this._speedMultiplier = .75;
                this._difficulty = 2;
                break;
            case 4:
                this._shuffleMultiplier = 1.5;
                this._speedMultiplier = .5;
                this._difficulty = 2;
                break;
            case 5:
                this._shuffleMultiplier = 1.8;
                this._speedMultiplier = .3;
                this._difficulty = 3;
                break;
            case 6:
                this._shuffleMultiplier = 2.5;
                this._speedMultiplier = .18;
                this._difficulty = 3;
                break;
        }
        Ball.init('gameAtlas' + this._difficulty, 'ball02');
        Cup.init('gameAtlas' + this._difficulty, 'cup_01', this._speedMultiplier);

        this._cupAnimationConfig = {
            key: 'lift',
            frames: this.anims.generateFrameNames('gameAtlas' + this._difficulty, { prefix: 'cup_', start: 1, end: 15, zeroPad: 2 }),
            frameRate: 30,
            repeat: 0,
        };
        if (this.anims.exists('lift')) { this.anims.remove('lift'); }

        this._wins = 0;
        this._losses = 0;

        this._state = GameState.SETUP;
    }

    public create(): void {
        // -- CREATE OBJECTS
        this._ball = Ball.create(this, this._ballStartPosition);

        this._cups = new Array<Cup>();
        for (let i = 0; i < 3; i++) {
            this._cups.push(Cup.create(this, this._cupStartPositions.get(i), i));
        }

        // -- CREATE CUP ANIMATION
        this.anims.create(this._cupAnimationConfig);

        for (let i = 0; i < this._cups.length; i++) {
            this.time.addEvent({
                delay: (i + 1) * 300,
                callback: this._cups[i].moveIntoScene,
                callbackScope: this._cups[i]
            });
        }
        this.time.addEvent({
            delay: 950,
            callback: this._ball.moveIntoScene,
            args: [this.advanceState, this],
            callbackScope: this._ball
        });

        // UI
        this._descText = this.add.bitmapText(0, 0, 'atari', 'Starting...', 14);
        this._winsText = this.add.bitmapText(760, 20, 'atari', `Wins: ${this._wins.toString()}`, 12);
        this._winsText.setOrigin(1, .5);
        this._lossesText = this.add.bitmapText(760, 40, 'atari', `Losses: ${this._losses.toString()}`, 12);
        this._lossesText.setOrigin(1, .5);

        new MenuButton(this, 20, this.game.scale.height - 70, 'back', () => {
            this.scene.start('MainMenu');
        });

        this._replayButton = new Phaser.GameObjects.Sprite(this, this.game.scale.width / 2, this.game.scale.width / 2 - 50, 'replayIcon');
        this._replayButton.on('pointerdown', () => {
            this.reset();
        });
        this._replayButton.on('pointerover', (pointer: Phaser.Input.Pointer) => {
            this._replayButton.setTint(0x7878ff);
        });
        this._replayButton.on('pointerout', (pointer: Phaser.Input.Pointer) => {
            this._replayButton.clearTint();
        });
        this._replayButton.visible = false;
        this._replayButton.alpha = 0;
        this._replayButton.setDisplaySize(.85, .85);
        this.add.existing(this._replayButton);
    }

    public advanceState(): void {
        console.log('advancing state from =>: ' + GameState[this._state]);
        this._state++;
        console.log('to =>: ' + GameState[this._state]);
    }

    public update(time: number, delta: number): void {
        switch (this._state) {
            case GameState.SETUP: {
                break;
            }
            case GameState.BEGIN: {
                this._descText.text = 'Starting new game...';
                this.hideBall();
                this.advanceState();
                break;
            }
            case GameState.BEGINNING: {
                break;
            }
            case GameState.SHUFFLE: {
                this._descText.text = 'Shuffling...';
                this.shuffle();
                this.advanceState();
                break;
            }
            case GameState.SHUFFLING: {
                break;
            }
            case GameState.PICK_ENABLE: {
                this._descText.text = 'Make a choice!';
                this.pickInputOn();
                this.advanceState();
                break;
            }
            case GameState.PICK_AWAIT: {
                break;
            }
            case GameState.REPLAY_ENABLE: {
                this.replayInputShow();
                this.advanceState();
                break;
            }
            case GameState.REPLAY_AWAIT: {
                break;
            }
        }
    }

    public reveal(choice: number): void {
        if (this._cups[choice].hasBall) {
            this._ball.moveAndShow(choice);
            this._cups[choice].lift( () => {
                this._ball.rollOut();
                this._descText.text = this._winStrings.get(Phaser.Math.RND.integerInRange(0, this._winStrings.size - 1));
                this._wins++;
                this._winsText.text = `Wins: ${this._wins}`;
                this.advanceState();
            });
        } else {
            this._cups[choice].lift( () => {
                this._descText.text = 'Sorry, You Lost!...';
                this._losses++;
                this._lossesText.text = `Losses: ${this._losses}`;
                for (let i = 0; i < this._cups.length; i++) {
                    if (this._cups[i].hasBall) {
                        this._ball.moveAndShow(i);
                        this._cups[i].lift( () => {
                            this._ball.rollOut();
                            this._cups[choice].drop();
                            this.advanceState();
                        });
                    }
                }
            });
        }
        for (let i = 0; i < this._cups.length; i++) {
            this._cups[i].removeInteractive();
            this._cups[i].clearTint();
        }
    }

    private hideBall(): void {
        let pos = this._ball.getPlacement();
        this._cups[pos].setHasBall(true);
        this._cups[pos].lift(() => {
                this._ball.moveAndHide(() => {
                    this._cups[pos].drop( () => {
                        this._ball.visible = false;
                        this.advanceState();
                    });
                });
            });
    }

    private shuffle(): void {
        this._shuffleItterations = Phaser.Math.RoundTo(Phaser.Math.RND.integerInRange(7, 12) * this._shuffleMultiplier);
        this.continueShuffle();
    }

    private continueShuffle(): void {
        // sort based on place on table
        this._cups.sort((a: Cup, b: Cup) => {
            return a.getPlacement() - b.getPlacement();
        });

        console.log('shuffles left:' + this._shuffleItterations);
        if (this._shuffleItterations === 0) {
            this.advanceState();
        } else {
            // select cups
            let choices = [0, 1, 2];
            let pick1 = Phaser.Math.RND.pick(choices);
            let choices2 = [];
            for (let i = 0; i < choices.length; i++) {
                if (choices[i] !== pick1) {
                    choices2.push(choices[i]);
                 }
            }

            let pick2 = Phaser.Math.RND.pick(choices2);
            let moveReverse: boolean = !!Phaser.Math.RND.integerInRange(0, 1);

            this._cups[pick1].moveToPosition(pick2, moveReverse);
            this._cups[pick2].moveToPosition(pick1, moveReverse, this.continueShuffle);

            // depth sort
            for (let i = 0; i <  this._cups.length; i++) {
                if (moveReverse) {
                    if (i === pick1) {
                        this._cups[i].setDepth(pick2);
                    } else if (i === pick2) {
                        this._cups[i].setDepth(pick1);
                    } else {
                        this._cups[i].setDepth(i);
                    }
                } else {
                    this._cups[i].setDepth(i);
                }
            }
            this._shuffleItterations--;
        }
    }

    private pickInputOn(): void {
        for (let i = 0; i < this._cups.length; i++) {
            this._cups[i].setInteractive(new Phaser.Geom.Rectangle(2, 60, 107, 155), Phaser.Geom.Rectangle.Contains);
            // this.input.enableDebug(this._cups[i]);
        }
    }

    private replayInputShow(): void {
        this._replayButton.visible = true;
        this.tweens.add({
            targets: this._replayButton,
            duration: 500,
            delay: 200,
            ease: 'cubicInOut',
            props: {alpha: 1, scale: 1},
        });

        this._replayButton.setInteractive({
            useHandCursor: true
        });
    }

    private reset(): void {
        this._replayButton.removeInteractive();
        this.tweens.add({
            targets: this._replayButton,
            duration: 500,
            delay: 200,
            ease: 'cubicInOut',
            props: {alpha: 0, scale: .85},
            onComplete: (tween: Phaser.Tweens.Tween, targets: any[], ...param: any[]) => {
                this._replayButton.visible = false;
                this._replayButton.setTint();
                this._state = GameState.BEGIN;
            },
            onCompleteParams: []
        });
    }
}