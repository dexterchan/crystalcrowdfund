const Joi = require("joi");
const _ = require("lodash");
const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();
const config=require("config");

const generateAuthToken = (req)=> { 
  
    const token = jwt.sign(_.pick(req, ["username"]), config.get('jwtPrivateKey'), {expiresIn:"1h"});
    
    return token;
}

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  
  if (error) return res.status(400).send(error.details[0].message);

  const token = generateAuthToken(req.body);
  res.send(token);
});

function validate(req) {
  const schema = {
    username: Joi.string()
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
module.exports.generateAuthToken=generateAuthToken;