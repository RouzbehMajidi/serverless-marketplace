'use strict';

var validate = require('./validate.js');
var db = require('./db.js');
var security = require('./security.js');

module.exports.create = async (event, context) => {
  try{
    var username = await validate.carts.create(event.body);
  }catch(err){
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  }

  return db.carts.create(username)
    .then(security.jwt.generate)
    .then((secret) => {
        return {
            statusCode: 200,
            body: JSON.stringify({
              username: username,
              secret: secret
            }),
          };
    })
    .catch(err => {
      console.log(err);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        }),
      };
    });
};

module.exports.addItem = async (event, context) => {
    try{
      var request = await validate.carts.update(event.body, event.requestContext.authorizer.principalId);
    }catch(err){
      console.log(err);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        }),
      };
    }

    return db.carts.get(request.username)
    .then((user) => {
      if(!user){
        return Promise.reject("Invalid user.");
      }

      if(user.cart[request.item]){
        var quantity = user.cart[request.item].quantity + 1;
        user.cart[request.item] =  {quantity: quantity};
      }else{
        user.cart[request.item] =  {quantity: 1};
      }
      return user;
    })
    .then(db.carts.update)
    .then(updateCart)
    .then((user) => {
      const totalCost = calculateTotalCost(user.cart);
      return {
          statusCode: 200,
          body: JSON.stringify({
            username: user.username,
            totalCost: totalCost,
            cart: user.cart
          }),
        };
    })
    .catch(err => {
      console.log(err);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err
        }),
      };
    });
};

module.exports.removeItem = async (event, context) => {
  try{
    var request = await validate.carts.update(event.body,event.requestContext.authorizer.principalId);
  }catch(err){
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  }

  return db.carts.get(request.username)
  .then((user) => {
    if(!user){
      return Promise.reject("Invalid user.");
    }
    if(user.cart[request.item]){
      var quantity = user.cart[request.item].quantity - 1;

      if(quantity == 0){
        delete user.cart[request.item];
      }else{
        user.cart[request.item] =  {quantity: quantity};
      }
    }else{
      return Promise.reject("Product not in cart");
    }
    return user;
  })
  .then(db.carts.update)
  .then(updateCart)
  .then((user) => {
    const totalCost = calculateTotalCost(user.cart);
    return {
        statusCode: 200,
        body: JSON.stringify({
          username: user.username,
          totalCost: totalCost,
          cart: user.cart,
        }),
      };
  })
  .catch(err => {
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};

module.exports.complete = async (event, context) => {
  try{
    var request = await validate.carts.complete(event.body,event.requestContext.authorizer.principalId);
  }catch(err){
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  }

  return db.carts.get(request.username)
  .then(updateCart)
  .then((user) => {
    if(user.cart.length == 0){
      return Promise.reject("There are currently no items in your cart.")
    }

    for(let product of user.cart){
      if(product.inventory_count < product[1].quantity){
        return Promise.reject(`There are currently only ${product.inventory_count} units of '${product[0]}' available in stock. In order to complete your cart please remove ${product[1].quantity - product.inventory_count} unit(s)`);
      }else{
        product.inventory_count -= product[1].quantity;
      }
    }
    return user;
  })
  .then(updateInventory)
  .then(user => {
    user.cart = {};
    return user;
  })
  .then(db.carts.update)
  .then(() => {
    return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successfully completed cart. 📦",
        }),
      };
  })
  .catch(err => {
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};


module.exports.info = async (event, context) => {
  try{
    var request = await validate.carts.info(event.body,event.requestContext.authorizer.principalId);
  }catch(err){
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  }

  return db.carts.get(request)
  .then(updateCart)
  .then((user) => {
    const totalCost = calculateTotalCost(user.cart);

    return {
        statusCode: 200,
        body: JSON.stringify({
          username: user.username,
          totalCost: totalCost,
          cart: user.cart
        }),
      };
  })
  .catch(err => {
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err
      }),
    };
  });
};

function getItem(item){
  return db.products.get(item[0])
  .then(product => {
    item[1].price = product.price;
    item.inventory_count = product.inventory_count;
    return item;
  })
}

function updateItem(item){
  var product = {
    title: item[0],
    price: item[1].price,
    inventory_count: item.inventory_count
  }

  return db.products.update(product)
  .then(product => {
    return product;
  })
}

function updateInventory(user) {
  user.cart = Object.entries(user.cart).map(product => updateItem(product[1]));
  return Promise.all(user.cart)
  .then(cart => {
    user.cart = cart;
    return user;
  });
}

function updateCart(user) {
  user.cart = Object.entries(user.cart).map(product => getItem(product));
  return Promise.all(user.cart)
  .then(cart => {
    user.cart = cart;
    return user;
  });
}

function calculateTotalCost(cart){
  var totalCost = 0;
  cart.forEach(item => {
    totalCost += item[1].price * item[1].quantity;
  });
  return totalCost;
}