const assert = require('assert');
const ganache = require('ganache-cli'); //access Eth test network
const Web3 = require('web3'); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future
const crypto = require('crypto');

const compiledContract=require("../ethereum/build/combined.json");

let accounts;
let fundFactory;
let Utility;
let MemberBoard;
const RSAAsyncSize=32;
const parseSolcCompiledContract = require("../ethereum/ParseSolcCompiledContract");
/*
function parseSolcCompiledContract(jsonOut){
    let contractABI={};
    let contractByteCode = {};
    let shortCName=[];
    const combinedABI_Code = (jsonOut.contracts);
    const contractNameLst = Object.keys(combinedABI_Code);
    //console.log(contractNameLst);
    contractNameLst.map((cName) => {
        const contractName = cName.split(":")[1];
        //console.log(combinedABI_Code[cName]);
        shortCName.push(contractName);
        contractABI[contractName] = JSON.parse(combinedABI_Code[cName].abi);
        contractByteCode[contractName] = Buffer.from(combinedABI_Code[cName].bin,"hex").toString('hex')  ;
    });
    return {contractNameLst:shortCName,contractABI,contractByteCode};
}
*/



describe("deploy funding contract",()=>{
    let fundRaiser;
    let fundAdmin;
    let admin;
    var contractName;
    let fundAddress;
    let fundContractABI;
    beforeEach(async()=>{
        //await web3.eth.getAccounts() not working with 1.0.0.46beta
        accounts = await web3.eth.getAccounts();
        fundAdmin = accounts[1];
        fundRaiser=accounts[2];
        admin = accounts[0];
        
        const {contractNameLst,contractABI,contractByteCode}=parseSolcCompiledContract(compiledContract);
        //console.log(contractNameLst);
        fundContractABI = contractABI["CrystalCrowdFund"];
        const deployContractFunc = async (contractName, actor, gas) => {
            assert(contractNameLst.indexOf(contractName) >= 0);
            return await new web3.eth.Contract(contractABI[contractName])
                .deploy({ data: contractByteCode[contractName] }) //tell web3 to prepare a copy of contract for deployment
                .send({
                    from: actor
                    , gas
                });
        }

        
        contractName="utility";
        Utility = await deployContractFunc(contractName,admin,368491);

        contractName="MemberBoard";
        MemberBoard=await deployContractFunc (contractName, admin,6541353);

        contractName = "CrystalCrowdFundFactory";
        fundFactory=await deployContractFunc (contractName, fundAdmin,6541353);
        
    });

    it("should return a funding contract",async()=>{
        const abstract="testing the first fund";
        const url="http://abc.com";
        
        //const docHash=await Utility.methods.gethashString(Buffer.from("abcd").toString("hex"),"abcd").call();
        const salt=await Utility.methods.getSalt().call();
        assert (salt.length>0);
        const docHash = await Utility.methods.gethashString(salt,"abcd").call();
        assert(docHash.length>0);
        const symHash= "0x"+crypto.randomBytes(RSAAsyncSize).toString('hex');;
        
        const retObj=await fundFactory.methods.createFund(
            fundRaiser
            ,abstract
            , url
            ,docHash
            , symHash
            )
            .send({from: fundAdmin
                ,  gas:6541353
            });
        assert(retObj!=undefined);

        
        const numFund=await fundFactory.methods.getNumberOfFunds().call();
        assert(numFund==1);
        const addresses=await fundFactory.methods.getDeployedFunds().call();
        fundAddress=addresses[0];
        assert(fundAddress);
        
        const abi = fundContractABI;
        const fund=  new web3.eth.Contract(
            abi
            ,fundAddress);
        //console.log(fund);
        
        const myabstract = await fund.methods.fundabstract().call();
        assert(myabstract==abstract);
        
        const myurl = await fund.methods.url().call();
        assert(myurl==url);

        const mydocHash = await fund.methods.dochash().call();
        assert(mydocHash==docHash);
        
        const numSymRecord= await fund.methods.getSymKeyRecordLength().call();
        assert(numSymRecord==1);
        const SymRecord = await fund.methods.investorSymKeyRecords(numSymRecord-1).call();
        //console.log(SymRecord);
        assert(SymRecord.hashID==symHash);
    });
});