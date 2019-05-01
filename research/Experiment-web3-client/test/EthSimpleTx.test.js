let url = "http://localhost:8545";
const web3 = require("../ethClient/web3")(url);
const TXN = require("../ethClient/EthSimpleTxn");
const assert = require("assert");
let accounts;
const ALLOW_TIMEOUT = 1000000;
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
  beforeEach(async () => {
    masterAcct = accounts[1];
    slaveAcct = accounts[2];
    password = "Abcd1234";
    myData = "Hello!";
    hexData = web3.utils.toHex(myData);
    txnCount = await web3.eth.getTransactionCount(masterAcct);
    mygasPrice = web3.utils.fromWei(
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
  });
  it("list account", () => {
    const txn = new TXN();
    txn.initialize(rawTxn);
    assert(typeof rawTxn.value == "string", "value is not string");
    console.log(txn);
  });
});
