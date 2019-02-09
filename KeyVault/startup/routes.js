const express = require("express");
const cors = require("cors");
const key = require("../routes/key")
const auth = require("../routes/auth");
const { error } = require("../middleware/error");


module.exports = (app)=>{
    app.use(cors());
    app.use(express.json());
    app.use("/api/key",key);
    app.use("/api/auth",auth)
    app.use(error);
};