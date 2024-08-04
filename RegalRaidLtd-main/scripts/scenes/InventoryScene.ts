import Phaser from 'phaser';

// Sample NFT data
const nfts = [
    { name: "Admiral", rarity: "Common", inUse: false, image:'assets/img/BasicWarrior.jpg' }, 
    { name: "Wukong", rarity: "Common", inUse: false, image:'assets/img/conquestWarrior.jpg' },  
    { name: "King", rarity: "Rare", inUse: false, image: 'assets/img/KingEagle.png' }, 
    { name: "General", rarity: "Rare", inUse: false, image: 'assets/img/FalconGeneral.png' }, 
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Wukong", rarity: "Legendary", inUse: false, image:'assets/img/WukongMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Admiral", rarity: "Legendary", inUse: false, image:'assets/img/AdmiralMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Wukong", rarity: "Legendary", inUse: false, image:'assets/img/WukongMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' },  
    // Add more sample NFTs as needed
];

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super('InventoryScene');
    }

    preload() {
        // Preload NFT images
        nfts.forEach(nft => {
            this.load.image(nft.name, nft.image);
        });
        this.load.image('map1', 'assets/img/UIBackground.jpg'); 

    }

    create() {
        // Background
        const textStyle = {
            fontSize: '18px',
            color: '#000', 
            padding: { x: 10, y: 5 },
            fontFamily: 'Garamond' // You can specify your desired font family here
        };

        const background = this.add.image(0, 0, 'background').setOrigin(0);
        background.displayWidth = this.game.config.width as number;
        background.displayHeight = this.game.config.height as number;
        this.cameras.main.setBackgroundColor('#0a2948');
        const gradientTexture = this.textures.createCanvas('gradientTexture', 2600, 2080);
        if(gradientTexture!=null){
        const ctx = gradientTexture.context;

        const gradient = ctx.createLinearGradient(0, 0, 0, gradientTexture.height);
        gradient.addColorStop(1, '#1E264F'); 
        gradient.addColorStop(0, '#000500'); 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gradientTexture.width, gradientTexture.height); 
        gradientTexture.refresh(); 
    //   gradientRect.postFX.addShine();
    const waterIcon = this.add.image(650, 370, 'map1').setOrigin(0.5, 0.5).setDisplaySize(1300, 740).setData('persistent', true); 

    }
        // Create and position the title
        const title = this.add.text(this.game.config.width as number / 2, 150, '- NFT Collection -', { ...textStyle, fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5).setData('persistent', true);

        // Display sorting dropdown
        const sortingSelect = this.add.dom(300, 70, 'select');
        sortingSelect.node.id = 'sorting';
        sortingSelect.node.innerHTML = `
            <option value="All">All</option>
            <option value="Legendary">Legendary</option>
            <option value="Rare">Rare</option>
            <option value="Common">Common</option>
        `;

        sortingSelect.addListener('change');

        // Display NFT cards
        this.renderInventory(nfts);
        
        // Handle sorting
        sortingSelect.on('change', (event: any) => {
            const sortingOption = event.target.value;
            this.sortNFTs(sortingOption);
        });
    }

    sortNFTs(sortingOption: string) {
        let sortedNFTs;
        switch (sortingOption) {
            case 'All':
                sortedNFTs = nfts;
                break;
            case 'Legendary':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Legendary');
                break;
            case 'Rare':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Rare');
                break;
            case 'Common':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Common');
                break;
            default:
                sortedNFTs = nfts; // Show all NFTs
        }
        // Sort by rarity within the filtered array
        sortedNFTs.sort((a, b) => {
            const rarityOrder = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3 };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
    
        this.renderInventory(sortedNFTs);
    }
    
    renderInventory(nftsToRender: any[]) {
        const textStyle = {
            fontSize: '18px',
            color: '#000', 
            padding: { x: 10, y: 5 },
            fontFamily: 'Garamond' // You can specify your desired font family here
        };
        const waterIcon = this.add.image(650, 370, 'map1').setOrigin(0.5, 0.5).setDisplaySize(1300, 740).setData('persistent', true); 

        // Remove previous inventory cards and dropdowns
        this.children.each(child => {
            if (child.type === 'Image' || child.type === 'Text') {
                if (child.getData('persistent')) return;
                child.destroy();
            }
        });
        this.children.each(child => {
            if (child.type === 'Text' && !child.getData('persistent')){   
                child.destroy();
            }
        });
    
        // Calculate center positions
        const centerX = this.scale.width / 2+90;
        const centerY = this.scale.height / 2+90;
    
        // Display NFT cards
        let x = centerX - (150 * 7 / 2); // Adjusted for 7 cards per row
        let y = centerY - (200 * Math.ceil(nftsToRender.length / 7) / 2); // Adjusted for 7 cards per row
        let rowCounter = 0;
        nftsToRender.forEach(nft => {
            const card = this.add.image(x, y, nft.name).setOrigin(0.5).setDisplaySize(145, 145); // Set size of the card
            card.setInteractive();
    
            // Handle card click event
            card.on('pointerdown', () => {
                console.log(`Selected ${nft.name}`);
                // Deselect all NFTs
                nfts.forEach(n => {
                    n.inUse = false;
                });
                // Select the clicked NFT
                nft.inUse = true;
                // Update the inventory
                this.renderInventory(nftsToRender);
            });
    
            x += 150;
            rowCounter++;
            if (rowCounter === 7) { // Adjusted to 7 images per row
                rowCounter = 0;
                x = centerX - (150 * 7 / 2); // Adjusted for 7 cards per row
                y += 200;
            }
    
            if (nft.inUse) {
                card.setTint(0xFFD700); // Highlight the selected NFT with a gold tint
                card.postFX.addShine();
            }
        });
    
    
        // Display NFT names and rarities
        nftsToRender.forEach((nft, index) => {
            const textX = centerX - (150 * 7 / 2) + (index % 7) * 150; // Adjusted for 7 cards per row
            const textY = centerY - (200 * Math.ceil(nftsToRender.length / 7) / 2) + Math.floor(index / 7) * 200 + 100; // Adjusted for 7 cards per row
            this.add.text(textX, textY, `${nft.name}\n(${nft.rarity})`, { ...textStyle, fontSize: '20px', color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        });
        
        // Display back button
        const backBtnBg = this.add.rectangle(centerX-90, this.scale.height - 40, 100, 50, 0x000000, 1).setInteractive();
        const backButton = this.add.text(centerX-90, this.scale.height - 40, 'Back', {...textStyle, fontSize: '24px', color: '#FFFFFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainScene'))
            .setOrigin(0.5);
        backBtnBg.on('pointerdown', () => this.scene.start('MainScene'));
    }
    
    
}
