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
        this.load.image('border2', 'assets/Transparent center/panel-transparent-center-028.png');
        this.load.image('border3', 'assets/Transparent center/panel-transparent-center-026.png');
     }

    create(): void {
        const gameManager: GameManager = this.getGameManager();

        this.gridWidth = this.scale.width / this.cellSize;
        this.gridHeight = this.scale.height / this.cellSize;    
        
        const sprite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setDisplaySize(this.scale.width, this.scale.height);
        this.drawGrid(); 
        
        if(sprite.preFX!=null) {
            sprite.preFX.addBlur(1, undefined, undefined, 0.03);   
            sprite.preFX.addBloom();  
            const fx = sprite.preFX.addReveal(0.1, .5, .5);

            this.tweens.add({
                targets: fx,
                progress: 1,
                hold: 1000,
                delay: 800,
                duration: 5000,
                ease: 'Cubic'  
            });

        }
        const statusBorder = this.createNineSlice(127, 55, 220, 90, 20, 20, 20, 20);
        // Ensure the text appears on top of the background rectangle
        statusBorder.setAlpha(0.85);
        this.statusBackground = this.add.graphics({fillStyle: {color: 0x000000, alpha: 0.5}});
        this.statusBackground.fillRect(17, 10, 220, 90); // Adjust size and position as needed
        
        

        this.enemyTerritoriesCounterBackground = this.add.graphics({fillStyle: {color: 0x880000, alpha: 0.5}});
        this.enemyTerritoriesCounterBackground.fillRect(this.scale.width - 212, this.scale.height - 80, 208, 70); // Adjust size and position as needed
        const enemyBorder = this.createNineSlice2(this.scale.width - 109, this.scale.height - 45, 208, 75, 20, 20, 20, 20);
        
        enemyBorder.setAlpha(0.85);
        const textStyle = this.createTextStyle('16px', '#FFF', 15, 5, 'Open Sans');
        

        this.enemyTerritoriesCounterText = this.add.text(this.scale.width - 190, this.scale.height - 57, 'Enemy Territories: 0', textStyle);

        // Make sure to update the counter when the enemy is born and territories change
        this.updateEnemyTerritoriesCounter();
        this.displayCurrentWeapon();
        
        this.coinsText = this.add.text(20, 20, 'Coins:', textStyle);
        this.territoriesText = this.add.text(20, 40, 'Territories Owned: 0', textStyle);
        this.playerNameText = this.add.text(20, 60, 'Player Name: ', textStyle);

        let shopBackground = this.add.graphics({fillStyle: {color: 0xffffff, alpha: 0.5}});
        let shopIconSize = 32; // The size you want for the shop icon
        let padding = 10; // Padding around the icon
        let shopBackgroundX = this.scale.width - (shopIconSize + padding * 2); // X position of the shop background
        let shopBackgroundY = 10; // Y position of the shop background, adjust as needed
        shopBackground.fillRect(shopBackgroundX, shopBackgroundY, shopIconSize + padding * 2, shopIconSize + padding * 2);

        // Add the shop icon on top of the white transparent background
        this.shopIcon = this.add.image(shopBackgroundX + padding + shopIconSize / 2, shopBackgroundY + padding + shopIconSize / 2, 'shop').setDisplaySize(shopIconSize, shopIconSize).setInteractive();
        this.shopIcon.on('pointerdown', () => this.scene.start('InventoryScene'));
        
        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        graphics.alpha = 1;
        
        this.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 1000, 
            delay: 0,
            repeat: 0
        });
        this.updateStatusText();

        this.time.addEvent({
            delay: 3000,
            callback: this.awardCoins,
            callbackScope: this,
            loop: true,
        });

        
        // Update enemy territories
    this.enemyTerritories = this.getGameManager().getEnemyTerritories();
    this.displayEnemyTerritories();
    }
    private displayEnemyTerritories(): void {
        // Loop through enemy territories and display them on the grid
        this.enemyTerritories.forEach(territory => {
            const enemyBox = this.createNineSlice2(territory.x * this.cellSize + this.cellSize / 2, territory.y * this.cellSize + this.cellSize / 2,
                this.cellSize, this.cellSize, 20, 20, 20, 20);
            enemyBox.setTint(0xFF0000);
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

    createTextStyle(fontSize, color, paddingX, paddingY, fontFamily) {
        return {
            fontSize: fontSize || '18px',
            color: color || '#000',
            padding: { x: paddingX || 10, y: paddingY || 5 },
            fontFamily: fontFamily || 'Garamond'
        };
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
        
        this.enemyTerritoriesCounterText.setText(`Enemy Territories: ${this.enemyTerritories.length}`, );
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
        this.playerNameText.setText(`Player Name: ${this.registry.get('username')}`);
    }
    // Define a function to generate the updated grid state
private generateGridState(): { x: number, y: number }[] {
    const gameManager: GameManager = this.getGameManager();
    const gridState: { x: number, y: number }[] = [];

    // Add player-owned territories to the grid state
    gameManager.ownedTerritories.forEach(territory => {
        gridState.push({ x: territory.x, y: territory.y });
    });

    // Add enemy territories to the grid state
    this.enemyTerritories.forEach(territory => {
        gridState.push({ x: territory.x, y: territory.y });
    });

    // Return the generated grid state
    return gridState;
}

// Update grid state whenever changes occur
    private updateGridState(): void {
        const gameManager: GameManager = this.getGameManager();
        const gridState = this.generateGridState();
        gameManager.updateGridState(gridState);
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
    private createNineSlice(x: number, y: number, width: number, height: number, leftWidth: number, rightWidth: number, topHeight: number, bottomHeight: number) {
        return this.add.nineslice(
            x,              // x-coordinate
            y,              // y-coordinate
            'border2',       // texture key
            undefined,      // frame (optional)
            width,          // width
            height,         // height
            leftWidth,      // leftWidth
            rightWidth,     // rightWidth
            topHeight,      // topHeight
            bottomHeight    // bottomHeight
        );
      }
      private createNineSlice2(x: number, y: number, width: number, height: number, leftWidth: number, rightWidth: number, topHeight: number, bottomHeight: number) {
        return this.add.nineslice(
            x,              // x-coordinate
            y,              // y-coordinate
            'border3',       // texture key
            undefined,      // frame (optional)
            width,          // width
            height,         // height
            leftWidth,      // leftWidth
            rightWidth,     // rightWidth
            topHeight,      // topHeight
            bottomHeight    // bottomHeight
        );
      }
    private drawGrid(): void {
        let gm = this.getGameManager();
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let color = 0xCCCCCC;
                if (this.isTerritoryOwned(x, y, gm)){//gm.country?.x == x && gm.country?.y == y) {
                    const cell = this.add.rectangle(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        this.cellSize,
                        this.cellSize,
                        color,
                        0
                    ).setFillStyle(0x0000FF, 0.5);
                    const borderFirst = this.createNineSlice(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2, 
                    this.cellSize, this.cellSize, 20, 20, 20, 20);
                    borderFirst.setAlpha(0.5);
                    borderFirst.postFX.addShine();

                    
                    // borderFirst.setTint(0x0000FF);

                } else {
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
    }


    private setCellInteractive(cell: Phaser.GameObjects.Rectangle, x: number, y: number): void {
        cell.setInteractive();
        cell.on('pointerdown', () => {
            const gameManager: GameManager = this.getGameManager();
            const isOwned = gameManager.ownedTerritories.some(t => t.x === x && t.y === y);
            const isEnemyTerritory = this.enemyTerritories.some(t => t.x === x && t.y === y);

            let adjacentPositions: { "x": integer, "y": integer }[] = [];
            let i: number;
            let j: number;
            let isAdjacent: boolean = false;
            for (i = -1; i < 2; i++) {
                for (j = -1; j < 2; j++) {
                    adjacentPositions.push({"x": x + i, "y": y + j})
                }
            }

            console.log(adjacentPositions);

            adjacentPositions.forEach((value, index) => {
                if (this.isTerritoryOwned(value.x, value.y, this.getGameManager())) {
                    isAdjacent = true;
                }
            })
            if (!isAdjacent) {
                return;
            }


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
                    gameManager.ownedTerritories.push({x, y});
                }
                cell.setFillStyle(0x0000FF, 0.5); // Ensure first block is immediately blue

                const personalBox = this.createNineSlice(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2, 
                this.cellSize, this.cellSize, 20, 20, 20, 20);
                personalBox.postFX.addShine();

                // personalBox.setTint(0x0000FF);
                personalBox.setAlpha(0.5);

                this.updateStatusText();
            }
        });
    }

    private generateInitialEnemy(): void {
        // Generate an initial enemy at a random edge of the map
        const edgeX = Math.floor(Math.random() * this.gridWidth);
        const edgeY = Math.floor(Math.random() * this.gridHeight);
        this.enemyTerritories.push({x: edgeX, y: edgeY});
        this.enemies.push(this.add.rectangle(
            edgeX * this.cellSize + this.cellSize / 2,
            edgeY * this.cellSize + this.cellSize / 2,
            this.cellSize,
            this.cellSize,
            0xFF0000,
            0.25
        ));
        
        const enemyBox =this.createNineSlice2(edgeX* this.cellSize + this.cellSize / 2, edgeY * this.cellSize + this.cellSize / 2, 
        this.cellSize, this.cellSize, 20, 20, 20, 20);
        
        enemyBox.setTint(0xFF0000);
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
                pos.x >= 0 && pos.x < this.gridWidth &&
                pos.y >= 0 && pos.y < this.gridHeight &&
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
                    0.25
                ));
    
                const enemyBox = this.createNineSlice2(newPosition.x * this.cellSize + this.cellSize / 2, newPosition.y * this.cellSize + this.cellSize / 2,
                    this.cellSize, this.cellSize, 20, 20, 20, 20);
                enemyBox.setTint(0xFF0000);
            }
        }
    }
    


    private isTerritoryOccupied(x: number, y: number, gameManager: GameManager): boolean {
        return gameManager.ownedTerritories.some(t => t.x === x && t.y === y) ||
            this.enemyTerritories.some(t => t.x === x && t.y === y);
    }

    private isTerritoryOwned(x: number, y: number, gameManager: GameManager): boolean {
        return gameManager.ownedTerritories.some(t => t.x === x && t.y === y);
    }


    private getGameManager(): GameManager {
        return this.registry.get('gameManager');
    }
}