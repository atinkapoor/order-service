const uuid = require('uuid');
const eventGen = require('./successEvent');
const generateSignature = require('./signature');

let generatedSignature = '';
let uniquePayload = {};

const getOrderSignature = async name => {
  const clientSecret = "XXXXXXXXXXXXXXXXXXXXXXXX";

  uniquePayload = eventGen(name);

  generatedSignature = await generateSignature(
    clientSecret,
    JSON.stringify(uniquePayload)
  );
  return {
    generatedSignature,
    uniquePayload
  };
};

const getOrderPayload = async (userContext, events, done) => {
  try {
    const name = `test_order-loadtest-${uuid.v4()}`;
    const signedPayload = await getOrderSignature(name);
    userContext.vars.generatedSignature = signedPayload.generatedSignature;
    userContext.vars.uniquePayload = signedPayload.uniquePayload;
    return done();
  } catch (e) {
    console.log('getOrderSignature Error------------>', e); // eslint-disable-line
    return done();
  }
};

module.exports = {
  getOrderPayload,
  getOrderSignature
};
