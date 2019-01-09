'use strict';

var validate = require('./validate.js');
var db = require('./db.js')

module.exports.update = async (event, context) => {
  return await validate.products.update(event.body)
  .then(db.products.update)
  .then(item => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully updated product.",
        product: item
      }),
    };
  })
  .catch(err => {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};

module.exports.getAll = async (event, context) => {
  return await db.products.getAll()
  .then(items => {
    let response = {
      statusCode: 200
    }
    if (items.length == 0){
      response.body = JSON.stringify({
        message: "No products available."
      })
    }else{
      response.body = JSON.stringify(items)
    }
    return response;
  })
  .catch(err => {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};

module.exports.query = async (event, context) => {
  return await validate.products.query(event.body)
  .then(db.products.query)
  .then(items => {
    let response = {
      statusCode: 200
    }
    if (items.length == 0){
      response.body = JSON.stringify({
        message: "No products match search query."
      })
    }else{
      response.body = JSON.stringify({
        message: `${items.length} product(s) found.`,
        products: items
      })
    }
    return response;
  })
  .catch(err => {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};

module.exports.purchase = async (event, context) => {
  return await validate.products.purchase(event.body)
  .then(db.products.get)
  .then(item => {
    if(item.inventory_count > 0){
      item.inventory_count --;
    }else{
      return Promise.reject("Product not available");
    }
    return item
  })
  .then(db.products.update)
  .then((item) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message:`${item.title} successfully purchased.`
      })
    }
  })
  .catch(err => {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};
