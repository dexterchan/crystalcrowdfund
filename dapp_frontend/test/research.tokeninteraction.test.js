
const assert = require('assert');
const ganache = require('ganache-cli'); //access Eth test network
const Web3 = require('web3'); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future

const compiledContract=require("../ethereum/build/research/combined.json");

const parseSolcCompiledContract = require("../ethereum/ParseSolcCompiledContract");


let accounts;
let MyToken;
var contractName;
let tokenInteract;
describe("Run token interaction",()=>{
    const initial=100;
    beforeEach(async()=>{
        accounts = await web3.eth.getAccounts();
        
        admin = accounts[0];
        nobody = accounts[1];
        const {contractNameLst,contractABI,contractByteCode}=parseSolcCompiledContract(compiledContract);
        //console.log(contractNameLst);
        contractName = "MyToken";
        MyToken=await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName],
            arguments: [ initial ] 
         }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: admin
            , gas:6541353
        });

        contractName = "TokenInteraction";
        tokenInteract=await new web3.eth.Contract(contractABI[contractName])
            .deploy({ data: contractByteCode[contractName],
                arguments: [ MyToken.options.address ] 
            }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: admin
            , gas:6541353
        });
        assert(tokenInteract);
    });
    it("check balance",async()=>{
        const amt=await MyToken.methods.balanceOf(admin).call();
        assert(amt==initial);
    });
    it("check token transfer inside Mytoken",async()=>{
        await MyToken.methods.transfer(nobody,1).send({
            from: admin
            , gas:600000
        });
        const amt=await MyToken.methods.balanceOf(nobody).call();
        assert(1==amt);
    });
    it("try token interaction with 3rd contract",async()=>{
        const amt2=await tokenInteract.methods.checkBalance(admin).call();
        assert(amt2==initial);
        /*
        await tokenInteract.methods.transferToken(nobody).send({
            from: admin
            , gas:600000
        });*/
        await tokenInteract.methods.deposit(1).send({
            from: admin
            , gas:600000
        });

    });
    
}
)