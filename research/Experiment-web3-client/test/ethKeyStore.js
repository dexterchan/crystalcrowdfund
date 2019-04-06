let url = "http://localhost:8545";

//url = "https://rinkeby.infura.io/v3/ddae119e519b4ed9b2d16eea07ab3498";
const web3 = require("../ethClient/web3")(url);
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const keythereum = require("keythereum");

let privateKey;
let gethAccount;
const ALLOW_TIMEOUT = 1000000;
let privateKeyStr =
  "c703257cca45ec4a84a86b2803865b09973cfca779a56f240cc84c1bf3514ac2";
let acctStr = "0xbd70ccc1ce2ee08f1765714c72073dbaa5f4d7ea";
privateKeyStr =
  "07845e6ae3e433629d905dbff2006756925d90e77baac0447950a25801fd6554";
acctStr = "0xa19468214fe24914f885a1bde7d43e9f223cf5c4";
beforeEach(() => {
  //const privateKeyBuffer = crypto.randomBytes(32); //256 bit private key
  privateKey = Buffer.from(privateKeyStr, "hex").toString("hex");
  gethAccount = Buffer.from(acctStr, "hex").toString("hex");
});

describe("Ethereum web3 private key store testing", () => {
  it("get address with given key", async () => {
    const status = await web3.eth.accounts.privateKeyToAccount(
      "0x" + privateKey
    );
    assert(status.address != undefined);
    //console.log(status);
  }).timeout(ALLOW_TIMEOUT);
});

describe(`keythereum to retrieve private key from geth account`, () => {
  it(`recover private key from geth account`, async () => {
    const datadir = "/data";
    const address = "0xbd70ccc1ce2ee08f1765714c72073dbaa5f4d7ea";
    const password = "Abcd1234";
    // Synchronous
    var keyObject = keythereum.importFromFile(address, datadir);

    // synchronous
    var rprivateKey = keythereum.recover(password, keyObject);
    //assert.equal(privateKey, rprivateKey.toString("hex"));
    console.log("debug", rprivateKey.toString("hex"));
    const status = await web3.eth.accounts.privateKeyToAccount(
      "0x" + rprivateKey.toString("hex")
    );
    assert.equal(
      status.address.toLowerCase(),
      address.toString("hex").toLowerCase()
    );
  }).timeout(ALLOW_TIMEOUT);
});

describe("deep dive private key retrieval from keystore object", () => {
  let keyStoreObjJson;
  beforeEach(async () => {
    jsonstr =
      '{"address":"bd70ccc1ce2ee08f1765714c72073dbaa5f4d7ea","crypto":{"cipher":"aes-128-ctr","ciphertext":"3e60ff06a9d51897622ddbc73ba3620b94b84311ffca9979e3db783ce49d0889","cipherparams":{"iv":"3e6512ed7d01b67b319215ecb4c721cd"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"ebf8a0d3b0937bbccbee2427a068a5ba551295e5557e39a162cb1d5f86016e0d"},"mac":"1540341898c957121494011ea231a24334897fa93d2cbeef48565f3ee040e3c4"},"id":"deff18f2-f3d1-45f2-967b-1ab0d88b0290","version":3}';
    keyStoreObjJson = JSON.parse(jsonstr);
  });
  it("Run private key retrieval", async () => {});
});
