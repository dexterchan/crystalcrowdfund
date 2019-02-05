const mongoose = require('mongoose');
const {logger} = require("./logging");
const config = require("config");
module.exports=()=>{
    const conn_str = config.get("db");
    mongoose.connect(conn_str)
        .then(() => logger.info(`Connected to MongoDB ${conn_str}....`));
  /*
  .catch(err => {
      logger.error('Could not connect to MongoDB...');
      throw err;
    });*/

}