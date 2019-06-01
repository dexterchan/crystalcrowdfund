let url = "http://localhost:8545";
const web3 = require("../ethClient/web3")(url);
const TXN = require("../ethClient/EthTransaction");
const assert = require("assert");
const keythereum = require("keythereum");
const secp256k1 = require("secp256k1/elliptic");
const rlp = require("rlp");
const debug = require("debug")("app:debug");

const { str2buf, keccak256 } = require("../utils/utility");
let accounts;
const ALLOW_TIMEOUT = 1000000;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  assert(accounts.length >= 3);
});

const getPrivateKey = (accountAddress, pwd) => {
  const datadir = "/data";
  const address = accountAddress;
  // Synchronous
  const keyObject = keythereum.importFromFile(address, datadir);

  // synchronous
  const rprivateKey =
    //"0x" +
    keythereum.recover(pwd, keyObject);
  //.toString("hex");

  return rprivateKey;
};
privateKeyToAddress = privateKey => {
  var privateKeyBuffer, publicKey;
  privateKeyBuffer = str2buf(privateKey);
  if (privateKeyBuffer.length < 32) {
    privateKeyBuffer = Buffer.concat([
      Buffer.alloc(32 - privateKeyBuffer.length, 0),
      privateKeyBuffer
    ]);
  }
  publicKey = secp256k1.publicKeyCreate(privateKeyBuffer, false).slice(1);
  return (
    "0x" +
    keccak256(publicKey)
      .slice(-20)
      .toString("hex")
  );
};
const sign = privateKey => {
  const msgHash = this.hash(false);
  const sig = ethUtil.ecsign(msgHash, privateKey);
  if (this._chainId > 0) {
    sig.v += this._chainId * 2 + 8;
  }
  Object.assign(this, sig);
};

describe("Run deep dive eth transaction experiment", () => {
  it("do a raw transaction with nouce ", async () => {
    const masterAcct = accounts[1];
    const slaveAcct = accounts[2];
    const password = "Abcd1234";
    const myData = "Hello!";
    const hexData = web3.utils.toHex(myData); //Buffer.from(myData).toString("hex");
    //remove "0x" before conversion from HEX to UTF8
    assert.equal(
      Buffer.from(hexData.substr(2), "hex").toString("utf8"),
      myData
    );
    const amount = "0.01";

    const txnCount = await web3.eth.getTransactionCount(masterAcct);
    const mygaslimit = 300000;
    const mygasPrice = web3.utils.fromWei(
      web3.utils.toWei(String(0.00021), "ether"),
      "gwei"
    );
    rawTxn = {
      //from: masterAcct,
      to: slaveAcct,
      gasPrice: web3.utils.toHex(mygasPrice),
      gasLimit: web3.utils.toHex(mygaslimit),
      nonce: web3.utils.toHex(txnCount),
      value: web3.utils.toHex(web3.utils.toWei(amount, "ether")),
      data: hexData
    };
    //debug(rawTxn);

    const privateKey = getPrivateKey(masterAcct, password);

    const derivedAddress = privateKeyToAddress(privateKey);
    assert.equal(
      Buffer.from(masterAcct.substr(2), "hex").toString("hex"),
      Buffer.from(derivedAddress.substr(2), "hex").toString("hex")
    );
    //console.log(masterAcct, "(", derivedAddress, ")", ":", privateKey);
    const txn = new TXN(rawTxn);

    //cannot run this txn.from before calling sign!!!
    try {
      debug(txn.from);
    } catch (ex) {
      //console.log(ex.message.match(/Invalid Signature/) != null);
      assert(ex.message.match(/Invalid Signature/) != null);
    }
    //console.log(privateKey);
    txn.sign(privateKey);
    assert.equal(
      txn.from.toString("hex"),
      Buffer.from(masterAcct.substr(2), "hex").toString("hex")
    );
    console.log(txn);
    rlpEncodedTxn = rlp.encode(txn.raw);

    const receipt = await web3.eth.sendSignedTransaction(
      "0x" + rlpEncodedTxn.toString("hex")
    );
  }).timeout(ALLOW_TIMEOUT);
});
