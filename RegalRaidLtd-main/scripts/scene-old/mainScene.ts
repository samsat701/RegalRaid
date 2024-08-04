import Phaser from 'phaser';
import GameManager from "../objects/gameManager";

export default class MainScene extends Phaser.Scene {
    private cellSize: number = 48;
    private gridWidth: number = 27;
    private gridHeight: number = 18;
    private currentWeaponImage: Phaser.GameObjects.Image | null = null;

    private statusBackground: Phaser.GameObjects.Graphics;

    private coinsText: Phaser.GameObjects.Text;
    private territoriesText: Phaser.GameObjects.Text;
    private playerNameText: Phaser.GameObjects.Text;
    private shopIcon: Phaser.GameObjects.Image;

    private enemyTerritoriesCounterText: Phaser.GameObjects.Text;
    private enemyTerritoriesCounterBackground: Phaser.GameObjects.Graphics;

    private enemyAttackTriggered: boolean = false;
    private enemies: Phaser.GameObjects.Rectangle[] = [];
    private enemyTerritories: { x: number, y: number }[] = [];
    private currentWeaponBoostText: Phaser.GameObjects.Text | null = null;

    

    constructor() {
        super('MainScene');
    }

    preload(): void {
        this.load.image('background', 'assets/img/background.png');
        this.load.image('shop', 'assets/img/shopbasket.png');
        this.load.image('shopBackground', 'assets/img/hahaha.jpeg');
        this.load.image('sword', 'assets/img/sword.png');
        this.load.image('bow', 'assets/img/bow.png');
        this.load.image('axe', 'assets/img/axe.png');
        this.load.image('buyButton', 'assets/img/icons8-buy-sign-96.png');
        this.load.image('bomb', 'assets/img/bomb2.png');
        this.load.image('pistol', 'assets/img/pistol.png');
    }

    create(): void {
        this.gridWidth = this.scale.width / this.cellSize;
        this.gridHeight = this.scale.height / this.cellSize;
        
    
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setDisplaySize(this.scale.width, this.scale.height);
        this.drawGrid();

        this.statusBackground = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
        this.statusBackground.fillRect(17, 10, 200, 70); // Adjust size and position as needed

        // Ensure the text appears on top of the background rectangle

        this.enemyTerritoriesCounterBackground = this.add.graphics({ fillStyle: { color: 0x880000, alpha: 0.5 } });
        this.enemyTerritoriesCounterBackground.fillRect(this.scale.width - 212, this.scale.height - 80, 208, 70); // Adjust size and position as needed

        this.enemyTerritoriesCounterText = this.add.text(this.scale.width - 208, this.scale.height - 74, 'Enemy Territories: 0', { fontSize: '16px', color: '#FFF' });

        // Make sure to update the counter when the enemy is born and territories change
        this.updateEnemyTerritoriesCounter();
        this.displayCurrentWeapon();
    
        this.coinsText = this.add.text(16, 16, 'Coins:', { fontSize: '16px', color: '#FFF' });
        this.territoriesText = this.add.text(16, 36, 'Territories Owned: 0', { fontSize: '16px', color: '#FFF' });
        this.playerNameText = this.add.text(16, 56, 'Player Name: ', { fontSize: '16px', color: '#FFF' });

        let shopBackground = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.5 } });
        let shopIconSize = 32; // The size you want for the shop icon
        let padding = 10; // Padding around the icon
        let shopBackgroundX = this.scale.width - (shopIconSize + padding * 2); // X position of the shop background
        let shopBackgroundY = 10; // Y position of the shop background, adjust as needed
        shopBackground.fillRect(shopBackgroundX, shopBackgroundY, shopIconSize + padding * 2, shopIconSize + padding * 2);

        // Add the shop icon on top of the white transparent background
        this.shopIcon = this.add.image(shopBackgroundX + padding + shopIconSize / 2, shopBackgroundY + padding + shopIconSize / 2, 'shop').setDisplaySize(shopIconSize, shopIconSize).setInteractive();
        this.shopIcon.on('pointerdown', () => this.scene.start('ShopScene'));


        this.updateStatusText();

        this.time.addEvent({
            delay: 3000,
            callback: this.awardCoins,
            callbackScope: this,
            loop: true,
        });
    }

    private getCoinBoostFactor(): number {
        const gameManager: GameManager = this.getGameManager();
        const currentWeapon = gameManager.getCurrentWeapon();
    
        // Define boost factors for each weapon
        const boostFactors = {
            sword: 2,
            bow: 5,
            axe: 10,
            bomb: 20,
            pistol: 50
        };
    
        // Return the boost factor for the current weapon, default to 1 if no weapon or weapon not in boostFactors
        return currentWeapon ? (boostFactors[currentWeapon.imageKey] || 1) : 1;
    }

    private displayCurrentWeapon(): void {
        const gameManager: GameManager = this.getGameManager();
        const currentWeapon = gameManager.getCurrentWeapon();
        
        // Define boost factors for each weapon
        const boostFactors = {
            sword: 2,
            bow: 5,
            axe: 10,
            bomb: 20,
            pistol: 50
        };
    
        if (currentWeapon) {
            const weaponImageKey = currentWeapon.imageKey; // Use the imageKey for the texture
            const weaponDisplayX = 50; // Adjust based on your UI layout, keeping it towards the bottom left
            const weaponDisplayY = this.scale.height - 100; // Position adjusted to accommodate larger image and box
            const bgWidth = 120; // Adjusted to fit both image and text
            const bgHeight = 100;
    
            // If a weapon image or boost text already exists, destroy them before creating new ones
            if (this.currentWeaponImage) {
                this.currentWeaponImage.destroy();
            }
            if (this.currentWeaponBoostText) {
                this.currentWeaponBoostText.destroy();
            }
    
            
    
            // Add the weapon image
            this.currentWeaponImage = this.add.image(weaponDisplayX, weaponDisplayY, weaponImageKey).setScale(1);
    
            // Calculate and display the boost percentage
            const boostFactor = boostFactors[currentWeapon.imageKey] || 1;
            const boostPercentage = `${boostFactor}% Boost`;
            this.currentWeaponBoostText = this.add.text(weaponDisplayX + 100, weaponDisplayY, boostPercentage, {
                fontSize: '25px',
                color: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    


    private updateEnemyTerritoriesCounter(): void {
        this.enemyTerritoriesCounterText.setText(`Enemy Territories: ${this.enemyTerritories.length}`);
    }

    private awardCoins(): void {
        const gameManager: GameManager = this.getGameManager();
        const boostFactor = this.getCoinBoostFactor();
        gameManager.coins += gameManager.ownedTerritories.length * boostFactor;
        this.updateStatusText();

        // Trigger enemy expansion setup here, after player owns 5 territories
        if (gameManager.ownedTerritories.length >= 5 && !this.enemyAttackTriggered) {
            this.triggerEnemyAttack();
        }
    }

    private updateStatusText(): void {
        const gameManager: GameManager = this.getGameManager();
        this.coinsText.setText(`Coins: ${gameManager.coins}`);
        this.territoriesText.setText(`Territories Owned: ${gameManager.ownedTerritories.length}`);
        this.playerNameText.setText(`Player Name: ${gameManager.playerName}`);
    }

    private triggerEnemyAttack(): void {
        this.enemyAttackTriggered = true;
        this.generateInitialEnemy(); // Make sure this method properly adds the first enemy territory
        
        // Start enemy expansion with a time event
        this.time.addEvent({
            delay: 1000, // Adjust time as needed
            callback: this.expandEnemies,
            callbackScope: this,
            loop: true,
        });
        this.updateEnemyTerritoriesCounter();
    }

    private drawGrid(): void {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let color = 0xCCCCCC;
                const cell = this.add.rectangle(
                    x * this.cellSize + this.cellSize / 2,
                    y * this.cellSize + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize,
                    color,
                    0
                ).setStrokeStyle(1, 0x000000, 1);

                this.setCellInteractive(cell, x, y);
            }
        }
    }

    

    private setCellInteractive(cell: Phaser.GameObjects.Rectangle, x: number, y: number): void {
        cell.setInteractive();
        cell.on('pointerdown', () => {
            const gameManager: GameManager = this.getGameManager();
            const isOwned = gameManager.ownedTerritories.some(t => t.x === x && t.y === y);
            const isEnemyTerritory = this.enemyTerritories.some(t => t.x === x && t.y === y);

            if (isOwned) {
                return;
            }

            let cost = isEnemyTerritory ? 50 : 5;
            if (gameManager.coins >= cost) {
                gameManager.coins -= cost;
                if (isEnemyTerritory) {
                    this.enemyTerritories = this.enemyTerritories.filter(t => t.x !== x || t.y !== y);
                    this.enemies.forEach(enemy => {
                        const enemyX = Math.floor(enemy.x / this.cellSize);
                        const enemyY = Math.floor(enemy.y / this.cellSize);
                        if (enemyX === x && enemyY === y) {
                            enemy.destroy();
                        }
                    });
                    this.enemies = this.enemies.filter(enemy => {
                        const enemyX = Math.floor(enemy.x / this.cellSize);
                        const enemyY = Math.floor(enemy.y / this.cellSize);
                        return enemyX !== x || enemyY !== y;
                    });
                } else {
                    gameManager.ownedTerritories.push({ x, y });
                }
                cell.setFillStyle(0x0000FF, 0.5); // Ensure first block is immediately blue
                this.updateStatusText();
            }
        });
    }

    private generateInitialEnemy(): void {
        // Generate an initial enemy at a random edge of the map
        const edgeX = Math.floor(Math.random() * this.gridWidth);
        const edgeY = Math.floor(Math.random() * this.gridHeight);
        this.enemyTerritories.push({ x: edgeX, y: edgeY });
        this.enemies.push(this.add.rectangle(
            edgeX * this.cellSize + this.cellSize / 2,
            edgeY * this.cellSize + this.cellSize / 2,
            this.cellSize,
            this.cellSize,
            0xFF0000,
            0.5
        ));
    }

    private expandEnemies(): void {
        const gameManager: GameManager = this.getGameManager();
        this.updateEnemyTerritoriesCounter();
        
        // Select one random enemy territory to expand from
        if (this.enemyTerritories.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.enemyTerritories.length);
            const territory = this.enemyTerritories[randomIndex];
            
            // Define adjacent positions
            const adjacentPositions = [
                { x: territory.x - 1, y: territory.y },
                { x: territory.x + 1, y: territory.y },
                { x: territory.x, y: territory.y - 1 },
                { x: territory.x, y: territory.y + 1 },
            ];
    
            // Shuffle adjacent positions to randomize direction
            const shuffledPositions = adjacentPositions.sort(() => 0.5 - Math.random());
    
            // Try to find a valid position to expand to
            const newPosition = shuffledPositions.find(pos => 
                pos.x >= 0 && pos.x < this.gridWidth && pos.y >= 0 && pos.y < this.gridHeight &&
                !this.isTerritoryOccupied(pos.x, pos.y, gameManager)
            );
    
            // If a valid position is found, add it to enemy territories and display it
            if (newPosition) {
                this.enemyTerritories.push(newPosition);
                this.enemies.push(this.add.rectangle(
                    newPosition.x * this.cellSize + this.cellSize / 2,
                    newPosition.y * this.cellSize + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize,
                    0xFF0000,
                    0.5
                ));
            }
        }
    }
    

    private isTerritoryOccupied(x: number, y: number, gameManager: GameManager): boolean {
        return gameManager.ownedTerritories.some(t => t.x === x && t.y === y) ||
               this.enemyTerritories.some(t => t.x === x && t.y === y);
    }

    private getGameManager(): GameManager {
        return (this.game as any).gameManager;
    }
}
