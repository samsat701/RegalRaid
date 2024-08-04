# TerraQuest Installation

```bash
# Clone phaser repository (yes, npx not npm)
$ npx gitget yandeu/phaser-project-template phaser-template
```
```bash
# Go into the repository
$ cd phaser-template
```
```bash
# Install dependencies
$ npm install
```
```bash
# Delete original src
$ rm -f src
```
```bash
# Clone src code
$ git clone https://github.com/ansht2/TQ.git src
```
```bash
# install coral 
$ npm i @coral-xyz/anchor
```
```bash
# Start the local development server (on port 8080)
$ npm start
```
## Configurations

// Add json resolve module in tsconfig.json
- Add `"resolveJsonModule": true,`in `compilerOptions` in tsconfig.json
- Comment out everything inside `local` function in `node_modules/@coral-xyz/anchor/dist/cjs/nodewallet.js` 
