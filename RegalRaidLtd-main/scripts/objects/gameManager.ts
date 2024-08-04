// GameManager.ts
import {Keypair} from "@solana/web3.js";

export default class GameManager { // Global game state synced across all players, should not contain player specific information
    // Properties and methods of your GameManager
    score: number = 0;
    country: { x: number; y: number } | null = null;
    player_name: string | null = null
    coins: number = 20;
    ownedTerritories: { x: number; y: number }[] = [];
    playerName = '';
    currentWeapon: { name: string; imageKey: string } | null = null;
    gameKey: Keypair;

    constructor(playerName: string) {
        this.player_name = playerName;
    }
    setCurrentWeapon(weaponKey: string, weaponName: string): void {
        this.currentWeapon = { name: weaponName, imageKey: weaponKey };
    }

    getCurrentWeapon(): { name: string; imageKey: string; } | null {
        return this.currentWeapon;
    }
    private gridState: { x: number, y: number }[] = [];

    // Method to update the grid state
    public updateGridState(newGridState: { x: number, y: number }[]): void {
        this.gridState = newGridState;
    }

    // Method to get the grid state
    public getGridState(): { x: number, y: number }[] {
        return this.gridState;
    }

    // Store enemy territories
    private enemyTerritories: { x: number, y: number }[] = [];

    // Method to get enemy territories
    public getEnemyTerritories(): { x: number, y: number }[] {
        return this.enemyTerritories;
    }

    // Method to update enemy territories
    public setEnemyTerritories(territories: { x: number, y: number }[]): void {
        this.enemyTerritories = territories;
    }
}
