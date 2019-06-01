let url = "http://localhost:8545";
const web3 = require("../ethClient/web3")(url);
const TXN = require("../ethClient/EthSimpleTxn");
const assert = require("assert");
const BN = require("bn.js");
let accounts;
const ALLOW_TIMEOUT = 1000000;
const keythereum = require("keythereum");

const {
  stripHexPrefix,
  stripZeros,
  toBuffer,
  padToEven,
  int2Buffer,
  int2Hex
} = require("../utils/utility");

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  assert(accounts.length >= 3);
});

describe("EthSimpleTxn run txn", () => {
  let masterAcct;
  let slaveAcct;

  const amount = "0.01";
  let txnCount;

  const mygaslimit = 300000;
  let mygasPrice;
  let rawTxn;
  let password;
  let myData;
  let hexData;
  let amountWei;

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

  beforeEach(async () => {
    masterAcct = accounts[1];
    slaveAcct = accounts[2];
    password = "Abcd1234";
    myData = "Hello!";
    hexData = web3.utils.toHex(myData);
    txnCount = await web3.eth.getTransactionCount(masterAcct);
    amountWei = web3.utils.toWei(amount, "ether");
    mygasPrice = web3.utils.fromWei(
      web3.utils.toWei(String(0.00021), "ether"),
      "gwei"
    );
    rawTxn = {
      //from: masterAcct,
      to: slaveAcct,
      gasPrice: new BN(mygasPrice),
      gasLimit: new BN(mygaslimit),
      nonce: new BN(txnCount),
      value: new BN(amountWei),
      data: hexData
    };
  });
  it("initialize TXN object", () => {
    const txn = new TXN();
    txn.initialize(rawTxn);
    //assert(typeof rawTxn.value == "string", "value is not string");

    assert.equal(
      txn.to.toString("hex").toLowerCase(),
      rawTxn.to.slice(2).toLowerCase()
    );
    /*
    console.log(
      `${mygasPrice}:${web3.utils.toHex(mygasPrice)}:${new BN(
        mygasPrice
      ).toString(16)}`
    );*/
    assert.equal(
      txn.gasPrice.toString("hex").toLowerCase(),
      int2Buffer(new BN(mygasPrice))
        .toString()
        .toLowerCase()
    );
    assert.equal(
      txn.value.toString("hex").toLowerCase(),
      int2Buffer(new BN(amountWei))
        .toString()
        .toLowerCase()
    );
    assert.equal(
      txn.nonce.toString("hex").toLowerCase(),
      int2Buffer(new BN(txnCount))
        .toString()
        .toLowerCase()
    );
    assert.equal(
      txn.gasLimit.toString("hex").toLowerCase(),
      int2Buffer(new BN(mygaslimit))
        .toString()
        .toLowerCase()
    );
    /*
    console.log(`nouce:${txn.gasLimit.toString("hex")}`);
    console.log(`nouce:${typeof txn.gasLimit}`);*/
  });

  it("sign the txn", async () => {
    const txn = new TXN();
    txn.initialize(rawTxn);
    const privateKey = getPrivateKey(masterAcct, password);
  }).timeout(ALLOW_TIMEOUT);
});
