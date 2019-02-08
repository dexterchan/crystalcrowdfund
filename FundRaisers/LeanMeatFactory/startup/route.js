const express = require('express');
const cors = require("cors");
const pig = require("../routes/pig");
const {error} = require("../middleware/error");

module.exports =(app)=>{
    app.use(cors());
    app.use(express.json());
    app.use("/api/pigs",pig);
    app.use(error);
}