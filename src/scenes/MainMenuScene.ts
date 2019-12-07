import { MenuButton } from '../ui/MenuButton';

export class MainMenuScene extends Phaser.Scene {
    private static sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
        key: 'MainMenu',
        active: false,
        visible: false,
    };

    constructor() {
        super(MainMenuScene.sceneConfig);
    }

    public create(): void {
        let desc = this.add.bitmapText(0, 0, 'atari' , 'Shell Game', 22);
        desc.setPosition(80, 45);

        let easyCup = new Phaser.GameObjects.Sprite(this, 350, 120, 'menuCup');
        easyCup.setTintFill(0xf17f8f);
        new MenuButton(this, 100, 100, 'Easy Peasy', () => {
            this.scene.start('ShellGame', {difficulty: 1});
        });
        new MenuButton(this, 100, 150, 'Easy', () => {
            this.scene.start('ShellGame', {difficulty: 2});
        });

        let mediumCup = new Phaser.GameObjects.Sprite(this, 350, 220, 'menuCup');
        mediumCup.setTintFill(0xffbb7c);
        new MenuButton(this, 100, 200, 'Medium', () => {
            this.scene.start('ShellGame', {difficulty: 3});
        });
        new MenuButton(this, 100, 250, 'Medium-ish', () => {
            this.scene.start('ShellGame', {difficulty: 4});
        });

        let difficultCup = new Phaser.GameObjects.Sprite(this, 350, 320, 'menuCup');
        difficultCup.setTintFill(0x8dbce8);
        new MenuButton(this, 100, 300, 'Difficult', () => {
            this.scene.start('ShellGame', {difficulty: 5});
        });
        new MenuButton(this, 100, 350, 'Super Hard', () => {
            this.scene.start('ShellGame', {difficulty: 6});
        });

        this.add.existing(easyCup);
        this.add.existing(mediumCup);
        this.add.existing(difficultCup);
    }
}
