const db = require("./startup/db");

const {Pig} = require("./models/pig");

db();

async function createPigs(numPigs){
    const pigs = await Promise.all(
        Array(parseInt(numPigs))
        .fill()
        .map(async (element, index) => {
            const pig= Pig.bornPig(0);
            await pig.save();
            return pig;
        })
    );
    return pigs;
    //console.log(pigs);
}


module.exports.createPigs=createPigs;