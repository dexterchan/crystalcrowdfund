const Joi = require("joi");
const Mongoose =require("mongoose");
const uuidv1 = require('uuid/v1');
const moment = require("moment");

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
    const bDate=moment().add(backDate*(-1),"days");
    pig = new Pig({
        pigid: pigid,
    bornDate: bDate.toDate(),//7 days ago
    weight: 1 + Math.random(),
    recordDate: bDate.toDate()
    });

    return pig;
}

PigSchema.methods.growEachMonth = async function(){
    
    const lastRecordDate = moment(this.recordDate);
    const bornDate = moment(this.bornDate);
    const age = moment.duration(lastRecordDate.diff(bornDate)).as("M");
    this.recordDate = lastRecordDate.add(1,"M").toDate();
    if(age<12 && this.weight<MAX_WEIGHT)
        this.weight += (growthrate * Math.random());
    //console.log(`Age: ${age} ${this.weight}`);
    await this.save();

}

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
