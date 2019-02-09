const express = require('express');
const app = express();



require("./logging")();
require("./routes")(app);

module.exports=(p)=>{
    const https = require("./httpsCreate")(app);
    return https.listen(p, function () {
      console.log(`Application listening to ${p}`)
    })
  }