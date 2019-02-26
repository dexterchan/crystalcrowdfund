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


describe("Run Member Board",()=>{
    let fundRaiser;
    let fundAdmin;
    let admin;
    var contractName;
    let fundAddress;
    let fundContractABI;
    const initCredit=1000000;
    beforeEach(async()=>{
        //await web3.eth.getAccounts() not working with 1.0.0.46beta
        accounts = await web3.eth.getAccounts();
        fundAdmin = accounts[1];
        fundRaiser=accounts[2];
        admin = accounts[0];
        
        const {contractNameLst,contractABI,contractByteCode}=parseSolcCompiledContract(compiledContract);
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


        
    });
    it("should reject insert member with non-admin account", async()=>{
        try{
            await MemberBoard.methods.addMember(fundRaiser,initCredit ).send({
                from: fundRaiser
                , gas:368491
            });
            
            throw new Error("NonAdminRunException");
        }catch(ex){
            if(ex.message == "NonAdminRunException"){
                throw ex;
            }
            
            assert(ex.message.match(/Only manager can access/)!=null);
        }
    });
    it("should reject double insertion of member", async()=>{
        try{
            await MemberBoard.methods.addMember(fundAdmin,initCredit ).send({
                from: admin
                , gas:368491
            });
            
            throw new Error("DoubleInsertionException");
        }catch(ex){
            if(ex.message == "DoubleInsertionException"){
                throw ex;
            }
            assert(ex.message.match(/has been registered once/)!=null);
        }
    });

    it("should allow insertion of new member", async()=>{
            await MemberBoard.methods.addMember(fundRaiser,initCredit ).send({
                from: admin
                , gas:368491
            });
    });
});