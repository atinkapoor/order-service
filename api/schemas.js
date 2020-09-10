const Joi = require('joi') 

const customerSchema = Joi.object().keys({ 
    fullname: Joi.string().required(), 
    email: Joi.string().required()
});

const orderdetailSchema = Joi.object().keys({ 
  orderid: Joi.string().required(), 
  product: Joi.string().required() ,
  quantity: Joi.number().positive().required(),
  productamount: Joi.number().positive().precision(2).required(),
  producttype: Joi.string().valid('veg', 'nonveg')
});

const orderSchema = Joi.object().keys({ 
    customerid: Joi.string().required(), 
    orderdate: Joi.date(),
    orderamount: Joi.number().positive().precision(2).required(),
    ordertype: Joi.string().valid('veg', 'nonveg', 'mix'),
    products: Joi.allow(orderdetailSchema)
});

module.exports = {
  customerSchema,
  orderSchema,
  orderdetailSchema
};