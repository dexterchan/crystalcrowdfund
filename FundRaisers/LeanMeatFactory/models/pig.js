const Joi = require("joi");
const Mongoose =require("mongoose");
const _ = require("lodash");
const uuidv1 = require('uuid/v1');
const moment = require("moment");
const bcrypt = require('bcrypt');

const MAX_WEIGHT=300;
const growthrate=MAX_WEIGHT/12;

const PigSchema = new Mongoose.Schema({
    pigid:{
        type:String,
        required:true
    },
    bornDate:{
        type:Date,
        required:true,
        default:Date.now
    },
    weight:{
        type:Number,
        required:true
    },
    recordDate:{
        type:Date,
        required:true,
    }
});
PigSchema.statics.getPigId =  function(){
    const rPiglst= Pig.distinct("pigid");
    /*
    await Pig.aggregate([
        {
            $group: {
                _id: "$pigid"
            }
        }]
    ).exec();*/
    return rPiglst;
};

PigSchema.statics.getGrowRecordDates = async function(){
    let rDateList;//= Pig.distinct("recordDate").sort({recordDate:-1});
    rDateList= await Pig.aggregate([
        {
            $group: {
                _id: "$recordDate"
            }
        }]
    ).sort({_id:-1});

    rDateList=rDateList.map((r)=>{return r._id});
    return rDateList;
}

PigSchema.statics.generatePigId=  function(){
    const id=uuidv1();
    return  id.replace(/-/g,"");
}

PigSchema.statics.lookup=async function(pid){
    const rPig= await Pig.find({pigid:pid}).sort({recordDate:-1}).limit(1);
    
    if(rPig.length>0)
        return rPig[0];
    else
        throw new Error("Not Found");
}

PigSchema.statics.bornPig = function(backDate){
    let pig;
    const pigid=PigSchema.statics.generatePigId();
    const bdate=new Date();
    const m = moment.utc(bdate.toISOString().split("T",1));
    const bDate=m.add(backDate*(-1),"days");
    pig = new Pig({
        pigid: pigid,
    bornDate: bDate.toDate(),//7 days ago
    weight: 1 + Math.random(),
    recordDate: bDate.toDate()
    });

    return pig;
}




PigSchema.statics.growEachMonth = async function(pigid){
    const rPig = await Pig.lookup(pigid);
    newPig = new Pig(_.pick(rPig,["pigid","bornDate","weight","recordDate"]));
    newPig._id=Mongoose.Types.ObjectId();
    const lastRecordDate = moment(newPig.recordDate);
    const bornDate = moment(newPig.bornDate);
    const age = moment.duration(lastRecordDate.diff(bornDate)).as("M");
    newPig.recordDate = lastRecordDate.add(1,"M").toDate();
    if(age<12 && newPig.weight<MAX_WEIGHT)
        newPig.weight += (growthrate * Math.random());
    //console.log(`Age: ${age} ${newPig.weight}`);
    
    await newPig.save();
    return newPig;
}

PigSchema.statics.lookupAggGrowthRecordByDate = async function(date){
    const sumweight=await Pig.aggregate(
        [
                {
                    $match: {
                        recordDate: date
                    }
                },
                {
                    $group: {
                        _id: null,
                        sum: {$sum: "$weight"}
                    }
                }
        ]
        );
    const growRecord = await Pig.find({recordDate:date}).sort({pigid:1});
    const strgrowrecord=JSON.stringify(growRecord);
    const salt = await bcrypt.genSalt(10);
    const reportHash = await bcrypt.hash(strgrowrecord, salt);
    return {sumweight,reportHash,growRecord};
};


function validatePig(pig) {
    const schema = {
        pigid: Joi.string().min(5).max(50).required(),
        bornDate: Joi.Date.required(),
        weight: Joi.number().min(0).required(),
        recordDate: Joi.Date.required()
    };
  
    return Joi.validate(pig, schema);
  }
const Pig = Mongoose.model('Pig',PigSchema);

module.exports.Pig=Pig;
module.exports.valudatePig=validatePig;

module.exports.createPigs= async function createPigs(numPigs){
    const pigs = await Promise.all(
        Array(parseInt(numPigs))
        .fill()
        .map(async (element, index) => {
            const pig= Pig.bornPig(0);
            return pig.save();
            //return pig;
        })
    );
    return pigs;
    //console.log(pigs);
}

module.exports.growPigs = async function (){
    const pigidList=await Pig.getPigId();
    return  Promise.all(
    pigidList.map(async (pigid, index) => {
            return new Promise( async (resolve,reject)=>{
                    const rPig = await Pig.lookup(pigid);
                    resolve(await Pig.growEachMonth(pigid));
                }
            );
        }
    )
    );
    /*
    for( p in pigidList){
        const pigid = pigidList[p];
        var rPig = await Pig.lookup(pigid);
        OrgWeight = rPig.weight;
        rPig = await Pig.growEachMonth(pigid);
    }
    return pigidList;*/
}


