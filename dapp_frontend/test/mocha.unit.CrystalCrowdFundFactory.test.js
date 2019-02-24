const assert = require('assert');
const ganache = require('ganache-cli'); //access Eth test network
const Web3 = require('web3'); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future
const crypto = require('crypto');

const compiledContract=require("../ethereum/build/combined.json");

let accounts;
let fundFactory;
let Utility;

const RSAAsyncSize=100;
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
    beforeEach(async()=>{
        //await web3.eth.getAccounts() not working with 1.0.0.46beta
        accounts = await web3.eth.getAccounts();
        fundAdmin = accounts[1];
        fundRaiser=accounts[2];
        admin = accounts[0];

        //console.log("running with following accounts:",accounts);
        
        /*
        const combinedABI_Code=(compiledContract.contracts);
        const contractNameLst=Object.keys(combinedABI_Code);
        console.log(contractNameLst);
        contractNameLst.map( (cName)=>{
            const contractName=cName.split(":")[1];
            //console.log(combinedABI_Code[cName]);
           contractABI[contractName] = JSON.stringify(combinedABI_Code[cName].abi);
           contractByteCode[contractName]=combinedABI_Code[cName].bin;
        });*/
        
        const {contractNameLst,contractABI,contractByteCode}=parseSolcCompiledContract(compiledContract);
        console.log(contractNameLst);
        const factoryName = "CrystalCrowdFundFactory";
        //console.log(contractNameLst);
        assert ( contractNameLst.indexOf(factoryName)>=0);

        //console.log(contractABI[factoryName]);
        
        fundFactory=await new web3.eth.Contract(contractABI[factoryName] )
        .deploy({data: contractByteCode[factoryName] }) //tell web3 to prepare a copy of contract for deployment
        .send({from: fundAdmin
            ,  gas:6541353
        });
        
        const utility="utility";
        Utility=await new web3.eth.Contract(contractABI[utility] )
        .deploy({data: contractByteCode[utility] }) //tell web3 to prepare a copy of contract for deployment
        .send({from: admin
            ,  gas:368491
        });
        
    });

    it("should return a funding contract",async()=>{
        const abstract="testing the first fund";
        const url="http://abc.com";
        
        //const docHash=await Utility.methods.gethashString(Buffer.from("abcd").toString("hex"),"abcd").call();
        const salt=await Utility.methods.getSalt().call();
        const docHash = await Utility.methods.gethashString(salt,"abcd");
        const symHash= crypto.randomBytes(RSAAsyncSize).toString('hex');;

        const fund=await fundFactory.methods.createFund(fundRaiser, 
            abstract, url,docHash, symHash);

        assert(fund);
    });
});