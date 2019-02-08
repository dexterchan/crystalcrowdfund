const express = require('express')
const app = express()
const https = require("./startup/httpsCreate")(app);




app.get('/', function (req, res) {
  res.send('hello world')
})


//PORT
const PORT=process.env.PORT || 9002

https.listen(PORT, function () {
  console.log(`Application listening to ${PORT}`)
})
