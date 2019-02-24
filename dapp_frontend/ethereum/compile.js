const path = require('path');
const fs = require('fs-extra');
const solc=require('solc');

const buildPath = path.resolve(__dirname,"build");
//remove all contents in folder "build"
fs.removeSync(buildPath); 

const myContractName="crystallcrowdfund.sol";
//Read source code 
const ContractPath = path.resolve(__dirname,'contracts',myContractName);
console.log(ContractPath);
const source = fs.readFileSync(ContractPath,'utf8');

const input = {
    language: 'Solidity',
    sources: {
        "crystallcrowdfund.sol": {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}

//Compile the solidity contract by solidity compiler
//const output= solc.compile(source,1).contracts;
const output=JSON.parse(solc.compile(JSON.stringify(input)));
console.log(output);


//Check if build path exists. If not, create the folder
fs.ensureDirSync(buildPath);

for (let contractName in output.contracts[myContractName]) {
    //console.log(contractName);
    //console.log(contractName + ': ' + output.contracts[myContractName][contractName].evm.bytecode.object)
    //console.log(contractName + ': ' + output.contracts[myContractName][contractName])

    let contract_evm = output.contracts[myContractName][contractName].evm;
    let contract_abi = output.contracts[myContractName][contractName].abi;
   // var abi = JSON.parse(output.contracts[myContractName][contractName].interface);
    
    fs.outputJsonSync(
        path.resolve(buildPath,contractName.replace(":","")+".evm.json"),
        contract_evm
    );

    fs.outputJsonSync(
        path.resolve(buildPath,contractName.replace(":","")+".abi.json"),
        contract_abi
    );
}
