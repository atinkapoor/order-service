'use strict';

const Joi = require('joi'); 
const schemas = require('./schemas'); 
const uuid = require('uuid');
const AWS = require('aws-sdk'); 
AWS.config.update({region:'us-east-1'});
AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = async event => {
  let statusCode = 200;
  let responseMessage = "";

  const requestBody = JSON.parse(event.body);
  const validateReq = await validateRequest(requestBody);

  if(validateReq == true) {
    const submitCust = await submitCustomer(requestBody);
    responseMessage = "Validation Success!"+submitCust.id;
  } else {
    responseMessage = "Validation Error!"+validateReq;
  }

  return {
    statusCode: statusCode,
    body: JSON.stringify(
      {
        message: responseMessage,
        //input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


async function validateRequest(requestBody) {
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
module.exports.validateRequest = validateRequest;

async function submitCustomer(customer) {
  const currentTime = new Date().toISOString();
  customer.id = uuid.v1();
  customer.submittedAt = currentTime;
  customer.updatedAt = currentTime;

  const customerInfo = {
    TableName: process.env.CUSTOMER_TABLE,
    Item: customer,
  };
  return dynamoDb.put(customerInfo).promise()
    .then(res => customer);
}
module.exports.submitCustomer = submitCustomer;
