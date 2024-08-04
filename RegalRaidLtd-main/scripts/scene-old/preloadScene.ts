export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png')
  }

  create() {
    this.scene.start('TransactionScene')

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
