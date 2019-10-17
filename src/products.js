"use strict";

var crypto = require("crypto");

var validate = require("./validate.js");
var db = require("./db.js");
var s3 = require("./s3.js");

//Create/update products handler
module.exports.update = async event => {
  return await validate.products
    .update(event.body)
    .then(async item => {
      if (item.photo) {
        var photoKey = crypto
          .createHash("sha256")
          .update(item.title)
          .digest("hex");

        await s3.savePhoto(photoKey, Buffer.from(item.photo, "base64"));

        item.photo = `https://${process.env.PHOTO_BUCKET}.s3.amazonaws.com/${photoKey}`;
      } else {
        item.photo = `https://${process.env.PHOTO_BUCKET}.s3.amazonaws.com/default.jpg`;
      }

      return item;
    })
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
