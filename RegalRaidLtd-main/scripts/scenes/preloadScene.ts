import blockchainClient from "./transaction";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png')
  }

  create() {
    // this.scene.start('CountryScene')
    // new blockchainClient().login(new Uint8Array([21,209,249,216,144,40,233,242,119,72,216,17,147,228,209,221,215,207,39,219,112,54,102,118,29,199,200,251,66,65,255,0,182,90,126,23,108,72,128,42,154,250,58,81,244,94,9,60,53,153,53,132,42,121,200,221,175,114,204,240,36,81,41,104]), "asfikn");



    /**
     * This is how you would dynamically import the CountryScene class (with code splitting),
     * add the CountryScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'CountryScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "CountryScene" */ './CountryScene').then(CountryScene => {
    //     this.scene.add('CountryScene', CountryScene.default, true)
    //   })
    // else console.log('The CountryScene class will not even be loaded by the browser')
  }
}
