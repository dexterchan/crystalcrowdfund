const assert = require("assert");
const ganache = require("ganache-cli"); //access Eth test network
const Web3 = require("web3"); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future
const crypto = require("crypto");

const compiledContract = require("../ethereum/build/combined.json");

let accounts;
let fundFactory;
let Utility;
let MemberBoard;
let StableCoin;
let initcoin=100000000000;
const RSAAsyncSize = 32;
const parseSolcCompiledContract = require("../ethereum/ParseSolcCompiledContract");

const transferCoinFunc=(from,to,amt)=>{
    return StableCoin.methods.transfer(to,amt).send(
        {
            from: from,
            gas:300000
        }
    );
};
const checkBalance=async(acc)=>{
    return StableCoin.methods.balanceOf(acc).call();
}

describe("Crowd funding contract", () => {
  let fundRaiser;
  let fundAdmin;
  let admin;
  let nobody;
  let investorA;
  let investorB;
  var contractName;
  let fundAddress;
  let fundContractABI;
  const initCredit = 1000000;
  const abstract = "testing the first fund";
  const url = "http://abc.com";
  let docHash;
  let symHash;

  const creatFundFunc=(creator, receiver)=>{
    return fundFactory.methods
      .createFund(StableCoin.options.address,receiver, abstract, url, docHash, symHash)
      .send({ from: creator, gas: 6541353 });
    }
  beforeEach(async () => {
    //await web3.eth.getAccounts() not working with 1.0.0.46beta
    accounts = await web3.eth.getAccounts();
    fundAdmin = accounts[1];
    fundRaiser = accounts[2];
    admin = accounts[0];
    nobody = accounts[3];
    investorA = accounts[4];
    investorB = accounts[5];
    const {
      contractNameLst,
      contractABI,
      contractByteCode
    } = parseSolcCompiledContract(compiledContract);
    //console.log(contractNameLst);
    fundContractABI = contractABI["CrystalCrowdFund"];
    const deployContractFunc = async (contractName, actor, gas) => {
      assert(contractNameLst.indexOf(contractName) >= 0);
      return await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName] }) //tell web3 to prepare a copy of contract for deployment
        .send({
          from: actor,
          gas
        });
    };

    contractName = "utility";
    Utility = await deployContractFunc(contractName, admin, 368491);

    contractName = "MemberBoard";
    MemberBoard = await deployContractFunc(contractName, admin, 6541353);
    //add a member
    await MemberBoard.methods.addMember(fundAdmin, initCredit).send({
      from: admin,
      gas: 368491
    });
    await MemberBoard.methods.addMember(fundRaiser, initCredit).send({
      from: admin,
      gas: 368491
    });
    contractName = "StablecoinV3";
    StableCoin=await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName],
            arguments: [ initcoin ] 
         }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: admin
            , gas:6541353
        });
    await transferCoinFunc(admin, investorA, 100000000);
    assert( (await checkBalance(investorA))==100000000);
    await transferCoinFunc(admin, investorB, 100000000);
    assert(await (checkBalance(investorB))==100000000);

    contractName = "CrystalCrowdFundFactory";
    //fundFactory=await deployContractFunc (contractName, fundAdmin,6541353);
    fundFactory = await new web3.eth.Contract(contractABI[contractName])
      .deploy({
        data: contractByteCode[contractName],
        arguments: [MemberBoard.options.address]
      }) //tell web3 to prepare a copy of contract for deployment
      .send({
        from: fundAdmin,
        gas: 6541353
      });

    const salt = await Utility.methods.getSalt().call();
    assert(salt.length > 0);
    docHash = await Utility.methods.gethashString(salt, "abcd").call();
    assert(docHash.length > 0);
    symHash = "0x" + crypto.randomBytes(RSAAsyncSize).toString("hex");
  });

  describe("setup a new funding contract", async () => {

    
    it("should reject funding contract creation if fund admin is non-member", async () => {
      try {
        const retObj = await creatFundFunc(nobody,fundRaiser);
        throw new Error("NonMemberException");
      } catch (ex) {
        if (ex.message == "NonMemberException") {
          throw ex;
        }
        
        try{
            assert(ex.message.match(/Not found the member/) != null);
        }catch(ex){
            console.log(ex.message);
        }
      }
    });

    it("should reject funding contract creation if fund raiser is non-member", async () => {
      try {
        const retObj = await creatFundFunc(fundAdmin,nobody);
        throw new Error("NonMemberException");
      } catch (ex) {
        if (ex.message == "NonMemberException") {
          throw ex;
        }
        try{
            assert(ex.message.match(/Not found the member/) != null);
        }catch(ex){
            console.log(ex.message);
        }
      }
    });
    it("should return a funding contract", async () => {
      const retObj =  await creatFundFunc(fundAdmin,fundRaiser);
      assert(retObj != undefined);

      const numFund = await fundFactory.methods.getNumberOfFunds().call();
      assert(numFund == 1);
      const addresses = await fundFactory.methods.getDeployedFunds().call();
      fundAddress = addresses[0];
      assert(fundAddress);

      //const abi = fundContractABI;
      const fund = new web3.eth.Contract(fundContractABI, fundAddress);
      //console.log(fund);

      const myabstract = await fund.methods.fundabstract().call();
      assert(myabstract == abstract);

      const myurl = await fund.methods.url().call();
      assert(myurl == url);

      const mydocHash = await fund.methods.dochash().call();
      assert(mydocHash == docHash);

      const numSymRecord = await fund.methods.getSymKeyRecordLength().call();
      assert(numSymRecord == 1);
      const SymRecord = await fund.methods
        .investorSymKeyRecords(numSymRecord - 1)
        .call();
      //console.log(SymRecord);
      assert(SymRecord.hashID == symHash);
    });
  });

  
  describe("investors deposit StableCoin to invest", async () => {
      let investAmt = 10000;
      let fund;
      beforeEach(async () => {
          const retObj = await creatFundFunc(fundAdmin, fundRaiser);
          assert(retObj != undefined);

          const numFund = await fundFactory.methods.getNumberOfFunds().call();
          assert(numFund == 1);
          const addresses = await fundFactory.methods.getDeployedFunds().call();
          fundAddress = addresses[0];
          assert(fundAddress);

          //const abi = fundContractABI;
          fund = new web3.eth.Contract(fundContractABI, fundAddress);
      })

    it("should return error if stablecoin failed to transfer", async()=>{
        await StableCoin.methods.transfer (fund.options.address,investAmt).send({
            from: investorA,
            gas: 368491
          });
        assert( (await checkBalance(fund.options.address))== investAmt);
        console.log(fund.options.address);
        console.log(await fund.methods.getAddress().call() );
        
        assert( (await fund.methods.getMyBalance().call())==investAmt);
          
        await fund.methods.depositStableCoin(investAmt).send({
            from: investorA,
            gas: 668491
          });
    });
  });
  
});
