
const assert = require('assert');
const ganache = require('ganache-cli'); //access Eth test network
const Web3 = require('web3'); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future

const compiledContract=require("../ethereum/build/combined.json");

const parseSolcCompiledContract = require("../ethereum/ParseSolcCompiledContract");


let accounts;

describe("Run Stablecoin",()=>{
    let fundRaiser;
    let fundAdmin;
    let admin;
    let nobody;
    let StableCoin;
    let initcoin=1000000;
    beforeEach(async()=>{
        accounts = await web3.eth.getAccounts();
        fundAdmin = accounts[1];
        fundRaiser=accounts[2];
        admin = accounts[0];
        nobody = accounts[3];
        const {contractNameLst,contractABI,contractByteCode}=parseSolcCompiledContract(compiledContract);
        const contractName="StablecoinV2";
        StableCoin=await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName],
            arguments: [ initcoin ] 
         }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: admin
            , gas:6541353
        });
    });


    describe("frozen the coin",async()=>{
        beforeEach(async()=>{

        });
        const frozenCoin=(p)=>{
            return StableCoin.methods.frozeCoin().send({
                from: p
                , gas:100000
            });
        }
        it("should return error if it is not admin",async()=>{
            try{
                await frozenCoin(nobody);
                console.log("not working");
                const frozenState = await StableCoin.methods.frozen().call();
                assert(frozenState);
                throw new Error("adminException");
            }catch(ex){
                if(ex.message=="adminException"){
                    throw ex;
                }
                //console.log(ex.message);
                assert(ex.message.match(/Only owner allowed/));
            }
        });
        it("return error if user transfer a frozen coin",async()=>{
            await frozenCoin(admin);
            await StableCoin.methods.transfer(fundRaiser,100).send(
                {
                    from: admin,
                    gas:300000
                }
            );
            console.log("transfered");
        });

    });
}
)