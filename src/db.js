"use strict";

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});
var DynamoClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10"
});

module.exports.products = {};

//Products table create/update product function
module.exports.products.update = product => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE,
    Item: product
  };
  return new Promise((resolve, reject) => {
    DynamoClient.put(params, err => {
      if (err) {
        reject(err);
      } else {
        resolve(product);
      }
    });
  });
};

//Products table get product function
module.exports.products.get = productTitle => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: {
      title: productTitle
    }
  };
  return new Promise((resolve, reject) => {
    DynamoClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Item);
      }
    });
  });
};

//Products table validate product exists in database function
module.exports.products.validate = productTitle => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: {
      title: productTitle
    }
  };
  return new Promise((resolve, reject) => {
    DynamoClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Item);
      }
    });
  });
};

//Products table query product function
module.exports.products.query = productQuery => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE
  };
  if (productQuery.onlyShowAvailableItems) {
    params.FilterExpression = "contains (title, :title) and quantity > :count";
    params.ExpressionAttributeValues = {
      ":title": productQuery.query,
      ":count": 0
    };
  } else {
    (params.FilterExpression = "contains (title, :title)"),
      (params.ExpressionAttributeValues = {
        ":title": productQuery.query
      });
  }
  return new Promise((resolve, reject) => {
    DynamoClient.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
};

//Products table get all products function
module.exports.products.getAll = () => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE
  };
  return new Promise((resolve, reject) => {
    DynamoClient.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
};

module.exports.carts = {};

//Carts table create cart function
module.exports.carts.create = username => {
  var user = {
    username: username,
    cart: {}
  };

  var params = {
    TableName: process.env.CARTS_TABLE,
    Item: user
  };
  return new Promise((resolve, reject) => {
    DynamoClient.put(params, err => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

//Carts table get cart function
module.exports.carts.get = username => {
  var params = {
    TableName: process.env.CARTS_TABLE,
    Key: {
      username: username
    }
  };
  return new Promise((resolve, reject) => {
    DynamoClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Item);
      }
    });
  });
};

//Carts table update cart function
module.exports.carts.update = user => {
  var params = {
    TableName: process.env.CARTS_TABLE,
    Item: user
  };
  console.log(user);
  return new Promise((resolve, reject) => {
    DynamoClient.put(params, err => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};
