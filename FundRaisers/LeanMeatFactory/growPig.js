const db = require("./startup/db");

const {Pig,growPigs} = require("./models/pig");

db();

let growthTime=12;

async function growallpigs(){
    for (var i=0;i<growthTime;i++){
        await growPigs();
    }
}

growallpigs();
