import Phaser, {Game} from 'phaser';
import blockchainClient from './transaction';
import GameManager from "../objects/gameManager";
import {use} from "matter"; 
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
export default class LoginScene extends Phaser.Scene {
  private walletIdInputText: Phaser.GameObjects.Text;
  private secretKeyInputText: Phaser.GameObjects.Text;
  private walletId: string = '';
  private secretKey: string = '';
  private isEnteringWalletId: boolean = true;
  private controlPress: boolean = false;

  constructor() {
    super('LoginScene');
  }

  preload(): void {
    // Load the logo image
    this.load.image('logo', 'assets/img/RegalRaidIcon.png'); 
    this.load.image('border', 'assets/Transparent center/panel-transparent-center-003.png');
    this.load.image('waterIcon', 'assets/img/waterIcon.png'); 
    this.load.image('spaceIcon', 'assets/img/spaceIcon.png'); 
    this.load.image('divider', 'assets/Divider Fade/divider-fade-001.png')
  }
  create(): void {

    // set general styling (currently ~ subject to change maybe)
    const textStyle = {
      fontSize: '18px',
      color: '#000', 
      padding: { x: 10, y: 5 },
      fontFamily: 'Garamond' // You can specify your desired font family here
    };
  

    // Using a color from the image, such as a deep ocean blue
    this.cameras.main.setBackgroundColor('#0a2948');
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 - 100; // Adjusted from -300 to -100

    
    function createStyledText(scene, x, y, text, style) {
      return scene.add.text(x, y, text, {
          fontSize: style.fontSize || '18px',
          color: style.color || '#000',
          backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 1)',
          padding: style.padding || { x: 10, y: 5 },
          fontFamily: style.fontFamily || 'Garamond'
      }).setOrigin(0.5, 0);
    }
 
    const gradientTexture = this.textures.createCanvas('gradientTexture', 1600, 500);
    if(gradientTexture!=null){
      const ctx = gradientTexture.context;

      const gradient = ctx.createLinearGradient(0, 0, 0, gradientTexture.height);
      gradient.addColorStop(1, '#1E264F'); 
      gradient.addColorStop(0, '#000500'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, gradientTexture.width, gradientTexture.height); 
      gradientTexture.refresh(); 
      const gradientRect = this.add.sprite(centerX, centerY-10, 'gradientTexture'); 
      gradientRect.postFX.addShine();

    }

    const dividerLeft = this.add.image(centerX-550, centerY-55, 'divider').setOrigin(0.5, 0.5);
    dividerLeft.setScale(1.8);
    dividerLeft.setTint(0x060918);
    const dividerRight = this.add.image(centerX+550, centerY-55, 'divider').setOrigin(0.5, 0.5);
    dividerRight.setScale(1.8);
    dividerRight.setRotation(Math.PI);
    dividerRight.setTint(0x060918);

    //left sea icon thing
    const waterBorder = this.createNineSlice(centerX-320, centerY-55, 320, 300, 20, 20, 20, 20);
    waterBorder.setTint(0x060918);
    const waterIcon = this.add.image(centerX-320, centerY-55, 'waterIcon').setOrigin(0.5, 0.5);
    waterIcon.setScale(.35); 
    waterIcon.setX(centerX-300); waterIcon.setAlpha(0); // (set some precons before)
    this.tweens.add({ targets: waterIcon, x: centerX - 320, alpha:1, duration: 800, ease: 'Back', delay: 150 });
    waterIcon.postFX.addShine();
    //right space theme
    const spaceBorder = this.createNineSlice(centerX+320, centerY-55, 320, 300, 20, 20, 20, 20);
    spaceBorder.setTint(0x060918);
    const spaceIcon = this.add.image(centerX+320, centerY-55, 'spaceIcon').setOrigin(0.5, 0.5);
    spaceIcon.setScale(.322); 
    spaceIcon.setX(centerX+300); spaceIcon.setAlpha(0); // (same thing -- todo: probably make an anim function for generals)
    this.tweens.add({ targets: spaceIcon, x: centerX + 320, alpha:1, duration: 800, ease: 'Back', delay: 150 });
    spaceIcon.postFX.addShine();

 
    //fit the main one
    const logoBorder = this.createNineSlice(centerX, centerY-55, 380, 380, 20, 20, 20, 20);
    logoBorder.setTint(0x060918);
    logoBorder.setY(centerY-80); logoBorder.setAlpha(0); // (set some precons before)
    this.tweens.add({ targets: logoBorder, y: centerY - 55, alpha:.85, duration: 900, ease: 'Cubic', delay: 1050 }); 

    //now the logo (-- change to new regal rebrand)
    const logo = this.add.image(centerX, centerY-55, 'logo').setOrigin(0.5, 0.5);
    logo.setScale(.765); // Scale the logo if needed 
    logo.setY(centerY-80); logo.setAlpha(0); // (set some precons before)
    this.tweens.add({ targets: logo, y: centerY - 55, alpha:1, duration: 900, ease: 'Cubic', delay: 1050 }); 
       
    logo.postFX.addShine();


    //large rectangle at the bottom (slight curve)
    const rectangleWidth = 1280;
    const rectangleHeight = 500;
    const rectangleX = centerX;
    const rectangleY = centerY + 150;  
    const rectangle = this.add.graphics();
    rectangle.fillStyle(0x060918, 1);  
    rectangle.fillRoundedRect(rectangleX - rectangleWidth / 2, rectangleY, rectangleWidth, rectangleHeight, 20); // Rounded corners
    // rectangle.postFX.addVignette(0.5, 0.5, 1, );
    
    
    this.add.text(centerX, centerY + 170, 'Username:', { ...textStyle, backgroundColor: 'rgba(255, 255, 255, 0)', fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5, 0);
    this.add.text(centerX, centerY + 270, 'Secret Key:', { ...textStyle, backgroundColor: 'rgba(255, 255, 255, 0)', fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5, 0);

    const walletID = this.createNineSlice(centerX, centerY+225, 900, 50, 20, 20, 20, 20);
    walletID.setTint(0x0a2948);
    // walletID.postFX.addShine();

    const secreteKeyID = this.createNineSlice(centerX, centerY+325, 900, 50, 20, 20, 20, 20);
    secreteKeyID.setTint(0x0a2948);
    // secreteKeyID.postFX.addShine();

    // Input texts with a slight transparent background to blend with the scene
    this.walletIdInputText = this.add.text(centerX, centerY + 210, '', {...textStyle, color: '#ACACAC', backgroundColor: 'rgba(108, 179, 185, 0.24)', padding: { x: 10, y: 5 } }).setOrigin(0.5, 0);
    this.secretKeyInputText = this.add.text(centerX, centerY + 315, '', { ...textStyle, fontSize: '8.5px',color: '#ACACAC', backgroundColor: 'rgba(108, 179, 185, 0.224)', padding: { x: 10, y: 5 } }).setOrigin(0.5, 0);

    // Interactive areas to detect which field is being typed into
    this.makeInteractive(this.walletIdInputText, true);
    this.makeInteractive(this.secretKeyInputText, false);

    // Keyboard input
    // this.input.keyboard!.on('paste', (event) => this.handlePaste(event));
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => this.handleKeyInput(event));

    createStyledText(this, centerX+555, centerY+123, 'Regal Raid Limited ©', {color: '#000000', backgroundColor: 'rgba(108, 179, 185, 0)'});

    // Submit Button with a color that complements the overall theme
    
    const submitButton = this.add.graphics()
      .setInteractive(new Phaser.Geom.Rectangle(centerX - 100, centerY + 400, 200, 50), Phaser.Geom.Rectangle.Contains)
      .fillStyle(0x467f43)
      .fillRoundedRect(centerX - 76, centerY + 375, 150, 50, 10)
      .setInteractive()
      .on('pointerdown', () => this.submitForm());
    submitButton.postFX.addBloom(); 
    // submitButton.postFX.addShine(.25); 
      

    const buttonText = this.add.text(centerX, centerY + 400, 'Login', { ...textStyle, fontSize: '28px', color: '#FFFFFF' }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.submitForm()); 
  }
  
  // ... rest of the class methods remain the same
  

  private makeInteractive(textObject: Phaser.GameObjects.Text, isWalletId: boolean): void {
    textObject.setInteractive()
      .on('pointerdown', () => {
        this.isEnteringWalletId = isWalletId;
        // Optionally, add visual feedback or a cursor effect
      });
  }

  private handleKeyInput(event: KeyboardEvent): void {
    if (this.isEnteringWalletId) {
      this.walletId = this.handleTextInput(event, this.walletId);
      this.walletIdInputText.setText(this.walletId);
    } else {
      this.secretKey = this.handleTextInput(event, this.secretKey);
      this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
    }
  }

  private handleTextInput(event: KeyboardEvent, text: string): string {
    if (event.keyCode === 8) { // Backspace
      return text.slice(0, -1);
    } else if (event.keyCode === 13) { // Enter
      this.isEnteringWalletId = !this.isEnteringWalletId;
      return text;
    } else if (event.ctrlKey && (event.key == 'v' || event.key == 'V')) {
      let thistext = '';
      console.log("Paste pressed!")
      window.navigator.clipboard.readText().then((text)=>{
          console.log("pressed", text);
          thistext = text;
        if (this.isEnteringWalletId) {
          this.walletId = text;
          this.walletIdInputText.setText(this.walletId);
        } else {
          this.secretKey = text;
          this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
        }
    });

    } else if (/^[a-zA-Z0-9]$/.test(event.key)) {
      return text + event.key;
    }
    return text;
  }

  private submitForm(): void {
    if (this.walletId.trim() !== '' && this.secretKey.trim() !== '') {
      // Proceed with the game
      console.log('Wallet ID:', this.walletId); // For debugging

      console.log("parsing", this.secretKey);
      let parsed = JSON.parse(this.secretKey);
      console.log("parsed", parsed);
      new blockchainClient(new Uint8Array(parsed)).login(new Uint8Array(parsed), this.walletId).then(
          (gameAcc) => {
            this.registry.set('gameAccount', gameAcc);
            this.registry.set('privateKey', new Uint8Array(parsed));
            this.registry.set('username', this.walletId);
            console.log('Secret Key:', this.secretKey); // For debugging
            let gm = new GameManager(this.walletId);
            gm.player_name =  this.walletId;
            console.log(gm.player_name)
            this.registry.set('gameManager', gm);
            this.scene.start('CountryScene');
          }
      );

 
    } else {
      // Handle the error case
      console.warn('Please enter both wallet ID and secret key.');
    }
  }
  private createNineSlice(x: number, y: number, width: number, height: number, leftWidth: number, rightWidth: number, topHeight: number, bottomHeight: number) {
    return this.add.nineslice(
        x,              // x-coordinate
        y,              // y-coordinate
        'border',       // texture key
        undefined,      // frame (optional)
        width,          // width
        height,         // height
        leftWidth,      // leftWidth
        rightWidth,     // rightWidth
        topHeight,      // topHeight
        bottomHeight    // bottomHeight
    );
  }
  // handlePaste(event){
  //   console.log("Handling paste!")
  //   event.preventDefault();
  //   const text = (event.clipboardData).getData('text');
  //   if (this.isEnteringWalletId) {
  //     this.walletId = text;
  //     this.walletIdInputText.setText(this.walletId);
  //   } else {
  //     this.secretKey = text;
  //     this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
  //   }
  // }
  
}
