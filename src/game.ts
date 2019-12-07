import 'phaser';
import Scenes from './scenes';

const config: Phaser.Types.Core.GameConfig = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: 'game',
    scene: Scenes,
    backgroundColor: '#fafafa',
    fps: {
        min: 30,
        target: 60
    },
    render: {
        antialias: true,
        antialiasGL: true,
        roundPixels: false,
        clearBeforeRender: true,
        powerPreference: 'high-performance'
    }
};

const game = new Phaser.Game(config);
