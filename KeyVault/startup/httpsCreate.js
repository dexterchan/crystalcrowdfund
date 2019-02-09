const path=require("path");
const fs = require('fs-extra')
const https = require('https')




module.exports=(app)=>{
    const keyPath= path.resolve(__dirname,"../","keys");
    const privateKeyFile = path.join(keyPath,"VAULT.privkey.pem");
    const certFile = path.join(keyPath,"VAULT.certificate.pem");
    return https.createServer({
        key: fs.readFileSync(privateKeyFile),
        cert: fs.readFileSync(certFile)
      }, app);
}

/*
'use strict';
const fetch = require('node-fetch');
const https = require('https');
const options = {
  agent:new https.Agent({rejectUnauthorized:false})
};
fetch(`https://dm-81.data.aliyun.com/rest/160601/ip/getIpInfo.json?ip=8.8.8.8`, options)
.then(console.log)
.catch(console.error);
*/