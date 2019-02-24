
module.exports= (jsonOut)=>{
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
