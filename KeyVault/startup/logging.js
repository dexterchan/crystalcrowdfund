require("express-async-errors");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
  //level: ['error'],
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console()
  ]
});

module.exports=()=>{
    process.on("uncaughtException", ex => {
        console.log("uncaughtException:");
    logger.error(ex.message, ex);
    process.exit(1);
    });
    process.on("unhandledRejection", ex => {
    console.log("we got unhandled promise rejection");
    logger.error(ex.message, ex);
    process.exit(1);
    });
}
module.exports.logger = logger;
