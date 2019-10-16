"use strict";

var validate = require("./validate.js");
var db = require("./db.js");

//Create/update products handler
module.exports.update = async event => {
  return await validate.products
    .update(event.body)
    .then(db.products.update)
    .then(item => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successfully updated product.",
          product: item
        })
      };
    })
    .catch(err => {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        })
      };
    });
};

//Get all products handler
module.exports.getAll = async () => {
  return await db.products
    .getAll()
    .then(items => {
      let response = {
        statusCode: 200
      };

      var message;

      if (items.length == 0) {
        message = "No products available. ☹️";
      } else {
        message = `There are currently ${items.length} item(s) in the marketplace.`;
      }

      response.body = JSON.stringify({
        message: message,
        itemCount: items.length,
        items: items
      });

      return response;
    })
    .catch(err => {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        })
      };
    });
};

//Query all products handler
module.exports.query = async event => {
  return await validate.products
    .query(event.body)
    .then(db.products.query)
    .then(items => {
      let response = {
        statusCode: 200
      };

      var message;

      if (items.length == 0) {
        message = "No products match search query.";
      } else {
        message = `${items.length} product(s) found.`;
      }

      response.body = JSON.stringify({
        message: message,
        itemCount: items.length,
        items: items
      });

      return response;
    })
    .catch(err => {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        })
      };
    });
};
