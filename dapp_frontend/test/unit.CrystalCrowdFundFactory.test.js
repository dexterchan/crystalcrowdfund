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


describe("deploy funding contract",()=>{
    let fundRaiser;
    let fundAdmin;
    let admin;
    let nobody;
    var contractName;
    let fundAddress;
    let fundContractABI;
    const initCredit=1000000;
    const abstract="testing the first fund";
    const url="http://abc.com";
    let docHash;
    let symHash;
    beforeEach(async()=>{
        //await web3.eth.getAccounts() not working with 1.0.0.46beta
        accounts = await web3.eth.getAccounts();
        fundAdmin = accounts[1];
        fundRaiser=accounts[2];
        admin = accounts[0];
        nobody = accounts[3];
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
        //add a member
        await MemberBoard.methods.addMember(fundAdmin,initCredit ).send({
            from: admin
            , gas:368491
        });
        await MemberBoard.methods.addMember(fundRaiser,initCredit ).send({
            from: admin
            , gas:368491
        });

        contractName = "CrystalCrowdFundFactory";
        //fundFactory=await deployContractFunc (contractName, fundAdmin,6541353);
        fundFactory=await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName],
            arguments: [ MemberBoard.options.address ] 
         }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: fundAdmin
            , gas:6541353
        });

        const salt=await Utility.methods.getSalt().call();
        assert (salt.length>0);
        docHash = await Utility.methods.gethashString(salt,"abcd").call();
        assert(docHash.length>0);
        symHash= "0x"+crypto.randomBytes(RSAAsyncSize).toString('hex');;
        
    });
    
    it("should reject funding contract creation if fund admin is non-member",async()=>{
        try{
            const retObj=await fundFactory.methods.createFund(
                fundRaiser
                ,abstract
                , url
                ,docHash
                , symHash
                )
                .send({from: nobody
                    ,  gas:6541353
                });
            throw new Error("NonMemberException"); 
        }catch(ex){
            if(ex.message == "NonMemberException"){
                throw ex;
            }
            assert(ex.message.match(/Not found the member/)!=null);
        }
    });

    it("should reject funding contract creation if fund raiser is non-member",async()=>{
        try{
            const retObj=await fundFactory.methods.createFund(
                nobody
                ,abstract
                , url
                ,docHash
                , symHash
                )
                .send({from: fundAdmin
                    ,  gas:6541353
                });
            throw new Error("NonMemberException"); 
        }catch(ex){
            if(ex.message == "NonMemberException"){
                throw ex;
            }
            assert(ex.message.match(/Not found the member/)!=null);
        }
    });
    it("should return a funding contract",async()=>{
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
        
        //const abi = fundContractABI;
        const fund=  new web3.eth.Contract(
            fundContractABI
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