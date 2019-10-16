"use strict";

var db = require("./db.js");

module.exports.products = {};

//Products update validator
module.exports.products.update = productJSON => {
  try {
    var product = JSON.parse(productJSON);
  } catch (err) {
    return Promise.reject("Invalid item JSON");
  }

  return new Promise((resolve, reject) => {
    if (!product) {
      reject("Invalid request.");
    }
    if (!product.title || product.title == "") {
      reject("Invalid item title.");
    }
    if (!product.price || product.price < 0) {
      reject("Invalid item price.");
    }
    if (!product.inventory_count || product.inventory_count < 0) {
      reject("Invalid item inventory count.");
    }
    resolve(product);
  });
};

//Products query validator
module.exports.products.query = productQueryJSON => {
  try {
    var productQuery = JSON.parse(productQueryJSON);
  } catch (err) {
    return Promise.reject("Invalid item query.");
  }
  return new Promise((resolve, reject) => {
    if (!productQuery) {
      reject("Invalid request.");
    }
    if (!productQuery.query) {
      reject("Invalid product search query.");
    }
    resolve(productQuery);
  });
};

module.exports.carts = {};

//Cart create validator
module.exports.carts.create = userJSON => {
  try {
    var user = JSON.parse(userJSON);
  } catch (err) {
    return Promise.reject("Invalid request.");
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      reject("Invalid user.");
    }
    if (!user.username || user.username == "") {
      reject("Invalid username.");
    }
    resolve(user.username);
  })
    .then(db.carts.get)
    .then(userQuery => {
      if (userQuery) {
        return Promise.reject(
          `The username '${user.username}' has already been taken. 😢`
        );
      } else {
        return user.username;
      }
    });
};

//Cart get info validator
module.exports.carts.info = (userJSON, principalID) => {
  try {
    var user = JSON.parse(userJSON);
  } catch (err) {
    return Promise.reject("Invalid user.");
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      reject("Invalid request.");
    }
    if (!user.username || user.username == "") {
      reject("Invalid username.");
    }
    if (user.username !== principalID) {
      reject("Unauthorized.");
    }
    resolve(user.username);
  })
    .then(db.carts.get)
    .then(userQuery => {
      if (userQuery) {
        return user.username;
      } else {
        return Promise.reject(`The cart does not exist.`);
      }
    });
};

//Cart update validator
module.exports.carts.update = (requestJSON, principalID) => {
  try {
    var request = JSON.parse(requestJSON);
  } catch (err) {
    return Promise.reject("Invalid request.");
  }

  if (!request) {
    reject("Invalid request.");
  }
  if (!request.username || request.username == "") {
    return Promise.reject("Invalid username.");
  }
  if (request.username !== principalID) {
    return Promise.reject("Unauthorized.");
  }
  if (!request.item || request.item == "") {
    return Promise.reject("Invalid item.");
  }

  return db.products.validate(request.item).then(item => {
    if (!item || item.inventory_count == 0) {
      return Promise.reject("Item not available.");
    } else {
      return request;
    }
  });
};

//Cart complete validator
module.exports.carts.complete = (requestJSON, principalID) => {
  try {
    var user = JSON.parse(requestJSON);
  } catch (err) {
    return Promise.reject("Invalid user.");
  }
  return new Promise((resolve, reject) => {
    if (!user) {
      reject("Invalid request.");
    }
    if (!user.username || user.username == "") {
      reject("Invalid username.");
    }
    if (user.username !== principalID) {
      reject("Unauthorized.");
    }
    resolve(user);
  });
};
