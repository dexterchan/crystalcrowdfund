const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const {publicKeyAsyncPromise,
    privateKeyAsyncPromise} = require("../KeyVaultService");

router.get("/:id",[auth],async(req, res)=>{
    let privatekey,publickey;
    try{
     privatekey=await privateKeyAsyncPromise(req.params.id);
     
    }catch(ex){
        res.status(400).send(ex.message);
    }
     res.send({privatekey});

});

module.exports=router;
