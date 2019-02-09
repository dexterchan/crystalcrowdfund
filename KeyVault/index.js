
/*
const express = require('express')
const app = express()



require("./startup/logging")();
require("./startup/routes")(app);


app.get('/', function (req, res) {
  res.send('hello world')
})*/


//PORT
const PORT=process.env.PORT || 9002

const runServer=require("./startup/runServer");
runServer(PORT);

