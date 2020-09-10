'use strict';

const Joi = require('joi'); 
const schemas = require('./schemas'); 
const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = async event => {
  let statusCode = 200;
  let responseMessage = "";

  const requestBody = JSON.parse(event.body);
  const validateReqOrder = await validateRequest(requestBody, schemas.orderSchema);

  if(validateReqOrder == true) {
    requestBody.products = await productType(requestBody.products);
    requestBody.ordertype = await orderType(requestBody.products);
//console.log(requestBody);
    const submitOrd = await submitOrder(requestBody);
    responseMessage = "Validation Success!";
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


async function validateRequest(requestBody, schemaName) {
  if (!requestBody.orderdate.trim()) {
    requestBody.orderdate = new Date().toISOString();
  }
  const { error } = Joi.validate(requestBody, schemaName); 
  const valid = error == null; 
  if (valid) { 
    return true; 
  } else { 
    const { details } = error; 
    const message = details.map(i => i.message).join(',');
    return message;
  }
}

async function productType(products) {
  const nonvegKeywords = [/chicken/, /mutton/, /beef/, /fish/, /egg/];
  for(var i = 0, len = products.length; i < len; i++){
    if(nonvegKeywords.some(rx => rx.test(products[i].product))){
      products[i].producttype = "nonveg"
    } else {
      products[i].producttype = "veg"
    }
    //console.log("products = " + products[i].product + " = " + products[i].producttype);
  }  
  return products;
}

async function orderType(products) {
  const orderTypeVeg = products.find(product => product.producttype === 'veg');
  const orderTypeNonVeg = products.find(product => product.producttype === 'nonveg');
  if(orderTypeVeg && orderTypeNonVeg) {
    return "mix";
  } else if(orderTypeVeg) {
    return "veg";
  } else {
    return "nonveg";
  }
}

async function submitOrder(orderData) {
  const currentTime = new Date().toISOString();
  let order = {};
  let orderdetail = {};
  order.id = uuid.v1();
  order.customerid = orderData.customerid;
  order.orderdate = orderData.orderdate;
  order.orderamount = orderData.orderamount;
  order.ordertype = orderData.ordertype;
  order.submittedAt = currentTime;
  order.updatedAt = currentTime;

  const orderInfo = {
    TableName: process.env.ORDER_TABLE,
    Item: order,
  };
  const subOrd = dynamoDb.put(orderInfo).promise()
    .then(res => order);
//console.log("order = " + order.id);

  for(var i = 0, len = orderData.products.length; i < len; i++){
    orderdetail = orderData.products[i];
    orderdetail.id = uuid.v1();
    orderdetail.orderid = order.id;
    orderdetail.submittedAt = currentTime;
    orderdetail.updatedAt = currentTime;
//console.log("orderdetail = " + orderdetail.id);
  
    let orderDetailInfo = {
      TableName: process.env.ORDER_DETAIL_TABLE,
      Item: orderdetail,
    };
    let subItem = dynamoDb.put(orderDetailInfo).promise()
      .then(res => orderdetail);
  }

  return true;
}
