import Phaser from 'phaser';
import GameManager from "../objects/gameManager";

export default class ShopScene extends Phaser.Scene {
    private gameManager: GameManager; // Reference to your GameManager

    constructor() {
        super({ key: 'ShopScene' });
    }

    preload(): void {
        // Preload your assets here
        this.load.image('shopBackground', 'assets/img/hahaha.jpeg');
        this.load.image('sword', 'assets/img/sword.png');
        this.load.image('bow', 'assets/img/bow.png');
        this.load.image('axe', 'assets/img/axe.png');
        this.load.image('buyButton', 'assets/img/icons8-buy-sign-96.png');
        this.load.image('bomb', 'assets/img/bomb2.png');
        this.load.image('pistol', 'assets/img/pistol.png');
        // ... more weapons and assets if needed ...
    }

    create(): void {
        this.gameManager = (this.game as any).gameManager as GameManager;

        this.add.image(this.scale.width / 2, this.scale.height / 2, 'shopBackground').setDisplaySize(this.scale.width, this.scale.height);

        const coinBalanceText = this.add.text(10, 10, `Coins: ${this.registry.get('gameManager').coins}`, { fontSize: '24px', color: '#ffd700', fontStyle: 'bold' }).setScrollFactor(0);

        const weapons = [
            { name: 'Sword', cost: 15, image: 'sword' },
            { name: 'Bow', cost: 50, image: 'bow' },
            { name: 'Axe', cost: 100, image: 'axe' },
            { name: 'Bomb', cost: 250, image: 'bomb' },
            { name: 'Pistol', cost: 500, image: 'pistol' }
            // ... more weapons as needed ...
        ];

        const weaponsContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);

        weapons.forEach((weapon, index) => {
            const weaponContainer = this.createWeaponSlot(weapon, index * 80 - (weapons.length * 40)); // Adjust for centering
            weaponsContainer.add(weaponContainer);
        });

        const backBtnBg = this.add.rectangle(this.scale.width - 100, this.scale.height - 40, 100, 50, 0x000000, 0.5).setInteractive();
        const backButton = this.add.text(this.scale.width - 100, this.scale.height - 40, 'Back', { fontSize: '24px', color: '#FFFFFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainScene'))
            .setOrigin(0.5);
        backBtnBg.on('pointerdown', () => this.scene.start('MainScene'));

        this.events.on('wake', () => {
            coinBalanceText.setText(`Coins: ${this.registry.get('gameManager').coins}`);
        });
    }

    private createWeaponSlot(weapon, yPosition): Phaser.GameObjects.Container {
        const bg = this.add.rectangle(0, 0, 400, 70, 0x000000, 0.5).setOrigin(0.5, 0.5); // Transparent background
        const weaponImage = this.add.image(-150, 0, weapon.image).setScale(0.5);
        const weaponText = this.add.text(-100, 0, `${weapon.name} - ${weapon.cost} Coins`, { fontSize: '20px', color: '#FFFFFF' }).setOrigin(0, 0.5);
        const buyButton = this.add.image(150, 0, 'buyButton').setInteractive().setScale(0.5);
        buyButton.on('pointerdown', () => this.purchaseWeapon(weapon, weaponText));

        const weaponContainer = this.add.container(0, yPosition, [bg, weaponImage, weaponText, buyButton]);
        return weaponContainer;
    }

    private purchaseWeapon(weapon, weaponText): void {
        if (this.registry.get('gameManager').coins >= weapon.cost) {
            this.registry.get('gameManager').coins -= weapon.cost;
            weaponText.setText(`${weapon.name} - Purchased`).setColor('#00ff00');
            // Adjust the call to match the new signature of setCurrentWeapon
            this.registry.get('gameManager').setCurrentWeapon(weapon.image, weapon.name);
        } else {
            weaponText.setText(`Not enough coins!`).setColor('#ff0000');
            this.time.delayedCall(2000, () => {
                weaponText.setText(`${weapon.name} - ${weapon.cost} Coins`).setColor('#FFFFFF');
            });
        }
    }
    
}
