const config=require("config");
const path=require("path");
const fs = require('fs-extra');
const debug=require("debug")("app:keystoredebug");
class MyKeyStore{
    constructor(){
        this.keyPath= path.resolve(__dirname,"keys");
        this.privKeyext= ".privkey.pem";
        this.pubKeyext=".pubkey.pem";
    }

    getPrivateKey(acct){
        const expectedFile = path.join( this.keyPath,acct+this.privKeyext);
        const file=fs.readFileSync(expectedFile);
        return file;
    }

    getPublicKey(acct){
        const expectedFile = path.join( this.keyPath,acct+this.pubKeyext);
        const file=fs.readFileSync(expectedFile);
        return file;
    }

    getPrivateKeyPromise(acct){
        return  new Promise((resolve, reject)=>{
            //async work
            const expectedFile = path.join( this.keyPath,acct+this.privKeyext);
            debug(expectedFile);
            fs.readFile(expectedFile, (err,data)=>{
                if(err ){
                    reject(new Error(`Failed to retrieve key ${acct} : ${err.message}`));
                }else{
                    resolve (data.toString("ascii"));
                }
            });
        });
    }

    getPublicKeyPromise(acct){
        return  new Promise((resolve, reject)=>{
            //async work
            const expectedFile = path.join( this.keyPath,acct+this.pubKeyext);
            debug(expectedFile);
            fs.readFile(expectedFile, (err,data)=>{
                if(err ){
                    reject(new Error(`Failed to retrieve public key ${acct} : ${err.message}`));
                }else{
                    resolve (data.toString("ascii"));
                }
            });
        });
    }
}


module.exports=MyKeyStore;