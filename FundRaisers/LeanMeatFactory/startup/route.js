const express = require('express');

const pig = require("../routes/pig");
const {error} = require("../middleware/error");

module.exports =(app)=>{
    app.use(express.json());
    app.use("/api/pigs",pig);
    app.use(error);
}