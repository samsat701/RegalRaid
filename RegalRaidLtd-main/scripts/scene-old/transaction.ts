import {Connection, clusterApiUrl, PublicKey, Keypair, Transaction, VersionedTransaction} from "@solana/web3.js";
import { Buffer } from "buffer";
import * as anchor from "@coral-xyz/anchor";
import GameManager from "../objects/gameManager";

import { AnchorProvider, Program, Idl, setProvider } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { CustomChainConfig } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";

import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';



import { SolflareAdapter } from '@web3auth/solflare-adapter';
import {SolanaPrivateKeyProvider, SolanaWallet} from "@web3auth/solana-provider";
import { WEB3AUTH_NETWORK } from "@web3auth/base";




export default class TransactionScene extends Phaser.Scene {

    solanaWallet: SolanaWallet;
    gameKey: Keypair;

    constructor() {
        super({ key: 'TransactionScene' })
    }

    preload() {
        this.load.image('phaser-logo', 'assets/img/phaser-logo.png')
    }

    async login() {

        const og_keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array([21,209,249,216,144,40,233,242,119,72,216,17,147,228,209,221,215,207,39,219,112,54,102,118,29,199,200,251,66,65,255,0,182,90,126,23,108,72,128,42,154,250,58,81,244,94,9,60,53,153,53,132,42,121,200,221,175,114,204,240,36,81,41,104]
        ))
        const wallet = new NodeWallet(og_keypair);

//const programId = '11111111111111111111111111111111';// '7sJLAqHhPvfXisTRb4Tp6qE8LwUUQDjgbvVKd75UWG71'//new anchor.web3.PublicKey('7sJLAqHhPvfXisTRb4Tp6qE8LwUUQDjgbvVKd75UWG71'); // Your program's public key
        const programId = new anchor.web3.PublicKey('7sJLAqHhPvfXisTRb4Tp6qE8LwUUQDjgbvVKd75UWG71');


        const gameAccount = new anchor.web3.Keypair();
        this.gameKey = gameAccount;
        GameManager

        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const provider = new AnchorProvider(connection, wallet, {});
        setProvider(provider);



        const program = new Program(IDL as Idl, programId);
        const txhash = await program.methods.initializeGame(new anchor.BN(42)).accounts({
            "game": gameAccount.publicKey,
            "user": wallet.publicKey,
            "system_program": programId
        }).signers([gameAccount]).rpc();

        console.log("Transaction Hash ", txhash);
    }



    create() {



        this.login().then(()=>(console.log("Logged in!")));

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
