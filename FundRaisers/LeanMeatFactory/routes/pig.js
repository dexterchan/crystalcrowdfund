const express = require('express');
const router = express.Router();


router.post("/",async(req,res)=>{
    if( !req.query.multiply){
        res.status(400).send("Not yet implemented");
    }
    res.status(200).send("ok");
});
module.exports = router;