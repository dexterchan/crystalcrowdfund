const express = require('express');
const app = express();
require("./startup/logging")();
require("./startup/route")(app);
require("./startup/db")();

/*
app.use(express.json());
app.get('/',(req,res)=>{
    
    //res.status(400).send("Not yet implemented");
    
    res.send({result:"ok"});
});*/


const port = process.env.PORT || 9001;
const server=app.listen(port, () => console.log(`Listening on port ${port}...`));


module.exports=server;