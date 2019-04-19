let url = "http://localhost:8545";

//url = "https://rinkeby.infura.io/v3/ddae119e519b4ed9b2d16eea07ab3498";
const web3 = require("../ethClient/web3")(url);
const assert = require("assert");
const EthereumTx = require("ethereumjs-tx");
const keythereum = require("keythereum");
const debug = require("debug")("app:debug");

let accounts;
const ALLOW_TIMEOUT = 1000000;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  assert(accounts.length >= 3);
});

describe("Run eth transaction experiment", () => {
  it("list accounts", async () => {
    // console.log(accounts);
    /*
    for (a in accounts) {
      const amt = await web3.eth.getBalance(accounts[a]);
      const aa = web3.utils.fromWei(amt, "ether");
      console.log(`${accounts[a]} balance: ${aa}`);
    }*/
    assert(accounts.length > 0);
  }).timeout(ALLOW_TIMEOUT);

  it("throw exception when fail to unlock", async () => {
    const masterAcct = accounts[1];
    const slaveAcct = accounts[2];
    const password = "NO";
    const unlockDuraction = 60;
    let unlocked = false;
    try {
      unlocked = await web3.eth.personal.unlockAccount(
        masterAcct,
        password,
        unlockDuraction
      );
      throw new Error("fail to throw ex with invalid password");
    } catch (ex) {
      assert(ex.message.match(/decrypt key with given passphrase/));
    }
  }).timeout(ALLOW_TIMEOUT);

  it("do a unlock of account ", async () => {
    const masterAcct = accounts[1];
    const slaveAcct = accounts[2];
    const password = "Abcd1234";
    const unlockDuraction = 10;
    let unlocked = false;
    try {
      unlocked = await web3.eth.personal.unlockAccount(
        masterAcct,
        password,
        unlockDuraction
      );
      assert(unlocked);
      //console.log(`unlock account${masterAcct}:${unlocked}`);
    } catch (ex) {
      assert(ex.message.match(/decrypt key with given passphrase/));
    } finally {
      const locked = await web3.eth.personal.lockAccount(masterAcct);
      assert(locked);
    }
  }).timeout(ALLOW_TIMEOUT);

  it("do a raw transaction with nouce ", async () => {
    const masterAcct = accounts[1];
    const slaveAcct = accounts[2];
    const password = "Abcd1234";
    const myData = "Hello!";
    const hexData = web3.utils.toHex(myData); //Buffer.from(myData).toString("hex");
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

    //sign the transaction
    var getPrivateKey = (accountAddress, pwd) => {
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
    const privateKey = getPrivateKey(masterAcct, password);
    //console.log("PrivateKey:", privateKey.toString("hex"));
    assert.equal(
      privateKey.toString("hex"),
      Buffer.from(
        ("0x" + privateKey.toString("hex")).substr(2),
        "hex"
      ).toString("hex")
    );

    const txn = new EthereumTx(rawTxn);
    //debug(txn.from);
    txn.sign(privateKey);
    debug(txn.from);
    const serializedTxn = txn.serialize();
    const Keccak = require("keccak");
    //Ethereum is using Keccak to hash the transaction
    const txnHash = Buffer.from(
      Keccak("keccak256")
        .update(serializedTxn)
        .digest("hex"),
      "hex"
    ).toString("hex");

    const receipt = await web3.eth.sendSignedTransaction(
      "0x" + serializedTxn.toString("hex")
    );
    //.on("receipt", console.log);
    //console.log("receipt", receipt);

    //console.log(txnHash);
    assert.equal(receipt.transactionHash, "0x" + txnHash);
  }).timeout(ALLOW_TIMEOUT);
});
