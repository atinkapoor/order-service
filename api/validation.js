'use strict';

const Joi = require('joi'); 
const schemas = require('./schemas'); 

async function validation(requestBody) {
  const { error } = Joi.validate(requestBody, schemas.customerSchema); 
  const valid = error == null; 
  if (valid) { 
    return true; 
  } else { 
    const { details } = error; 
    const message = details.map(i => i.message).join(',');
    return message;
  }
}
module.exports = validation;

