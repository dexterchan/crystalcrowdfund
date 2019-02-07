const db = require("./startup/db");

const {Pig,createPigs} = require("./models/pig");

db();

createPigs(2);