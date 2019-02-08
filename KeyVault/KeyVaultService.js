const config=require("config");
const path=require("path");
const debug=require("debug")("app:keystoredebug");
//Configuration
const SrcKeyStore = config.get("store");
//load keystore
const MyKeyStore=require("./"+SrcKeyStore);

keyStore=new MyKeyStore();
privateKeyFunc=(acct)=>{
    try{
    return keyStore.getPrivateKey(acct).toString("ascii")
    }catch(err){
        throw new Error(`user ${acct} key not found`)
    }
};

publicKeyFunc=(acct)=>{
    try{
    return keyStore.getPublicKey(acct).toString("ascii");
    }catch(err){
        throw new Error(`user ${acct} cert not found`)
    }
};

privateKeyAsyncPromise=(acct)=>{
    return keyStore.getPrivateKeyPromise(acct);
}

publicKeyAsyncPromise=(acct)=>{
    return keyStore.getPublicKeyPromise(acct);
}

/*
getPrivateKey =async (acct)=>{
    let file;
    try{
         file = await privateKeyAsyncPromise(acct);
         console.log(file);
    }catch(Err){

        console.log(Err.message);
    }
    
}

getPublicKey =async (acct)=>{
    let file;
    try{
         file = await publicKeyAsyncPromise(acct);
         console.log(file);
    }catch(Err){

        console.log(Err.message);
    }
    
}

getPublicKey("hirer");
*/

module.exports.publicKeyFunc=publicKeyFunc;
module.exports.privateKeyFunc=privateKeyFunc;
module.exports.publicKeyAsyncPromise=publicKeyAsyncPromise;
module.exports.privateKeyAsyncPromise=privateKeyAsyncPromise;