const express = require('express');
const router = express.Router();

const {Pig} = require("../models/pig");


router.post("/born",async(req,res)=>{
    let pig;
    pig =  Pig.bornPig(0);
    pig=await pig.save();
    //res.status(400).send("Not yet implemented");
    
    res.send(pig);
});


router.get("/GrowRecordDates",async(req,res)=>{
    const dateList=await Pig.getGrowRecordDates();
    res.send(dateList);
});

router.get("/GetGrowthReport/:date",async(req,res)=>{
    const d=new Date(req.params.date);

    const {sumweight,reportHash,growRecord} = await Pig.lookupAggGrowthRecordByDate(d);

    
    res.send({sumweight,reportHash,growRecord} );       
});

module.exports = router;