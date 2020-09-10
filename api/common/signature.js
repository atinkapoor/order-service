const crypto = require('crypto');

const generateSignature = async (clientSecret, body) => {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(body)
    .digest('hex');
};

module.exports = generateSignature;
