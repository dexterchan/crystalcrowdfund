const {logger} = require("../startup/logging");


module.exports.error=(err,req,res,next)=>{
    logger.log({level: 'error',message:err.message});
    res.status(500).send("Error:"+err.message);
}