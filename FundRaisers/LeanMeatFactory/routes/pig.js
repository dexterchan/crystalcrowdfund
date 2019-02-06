const express = require('express');
const router = express.Router();

const {Pig} = require("../models/pig");


router.post("/born",async(req,res)=>{
    let pig;
    pig = Pig.bornPig(0);

    //res.status(400).send("Not yet implemented");
    
    res.send(pig);
});
module.exports = router;