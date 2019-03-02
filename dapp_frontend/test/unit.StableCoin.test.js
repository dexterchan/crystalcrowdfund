
const assert = require('assert');
const ganache = require('ganache-cli'); //access Eth test network
const Web3 = require('web3'); //Web3 "class"
const web3 = new Web3(ganache.provider()); //instance of Web3 connecting to ganache, replace it with main,test eth in future

const compiledContract=require("../ethereum/build/combined.json");

const parseSolcCompiledContract = require("../ethereum/ParseSolcCompiledContract");


let accounts;
const contractName="Stablecoin";

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
        //console.log(contractNameLst);
        StableCoin=await new web3.eth.Contract(contractABI[contractName])
        .deploy({ data: contractByteCode[contractName],
            arguments: [ initcoin ] 
         }) //tell web3 to prepare a copy of contract for deployment
        .send({
            from: admin
            , gas:6541353
        });
    });
    const frozenCoinFunc=(p)=>{
        return StableCoin.methods.frozeCoin().send({
            from: p
            , gas:100000
        });
    }
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

    it("should return error if user overdraft balance",async ()=>{
        try{
            await transferCoinFunc(admin,fundRaiser,initcoin*10);
            throw new Error("ODException");
        }catch(ex){
            if(ex.message=="ODException"){
                throw ex;
            }
            assert(ex.message.match(/return false if specified value is less than/i));
        }
    });

    it("should transfer amount with correct balance",async ()=>{
        
            const amt = initcoin/10;
            const recinitBalance = await checkBalance(fundRaiser);
            const sendinitBalance = await checkBalance(admin);
            await transferCoinFunc(admin,fundRaiser,amt);
            const recfinalBalance = await checkBalance(fundRaiser);
            const sendfinalBalance= await checkBalance(admin);
            assert ((recfinalBalance-recinitBalance)==amt);
            assert ((sendinitBalance-sendfinalBalance)==amt);
        
    });

    describe("frozen the coin",async()=>{
        beforeEach(async()=>{

        });
        
        it("should return error if it is not admin",async()=>{
            try{
                await frozenCoinFunc(nobody);
                const frozenState = await StableCoin.methods.frozen().call();
                assert(frozenState);
                throw new Error("adminException");
            }catch(ex){
                if(ex.message=="adminException"){
                    throw ex;
                }
                console.log("read error:",ex.message);
                assert(ex.message.match(/owner allowed/));
            }
        });
        it("return error if user transfers a frozen coin",async()=>{
            await frozenCoinFunc(admin);
            try{
                await transferCoinFunc(admin,fundRaiser,1000);
                throw new Error("transferFrozenCoinException");
            }catch(ex){
                if(ex.message=="transferFrozenCoinException"){
                    throw ex;
                }
                assert(ex.message.match(/Coin is frozen/));
            }
        });

    });
}
)