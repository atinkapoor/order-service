'use strict';
const uuid = require('uuid');
const testUtils = require('./common/utils');

let uniqPayload = {};
let generatedSignature = "";

module.exports.submit = async event => {
  const unixEpoch = new Date().getTime();
  const todayDate = new Date()
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, '');

  let name = `test_order-${todayDate}-${uuid.v4()}`;
  const signedPayload = await testUtils.getOrderSignature(name);
  uniqPayload = signedPayload.uniquePayload;
  generatedSignature = signedPayload.generatedSignature;

  return {
    statusCode: '200',
    body: JSON.stringify(
      {
        uniqPayload,
        generatedSignature
      },
      null,
      2
    ),
  };
};
