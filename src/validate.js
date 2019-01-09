'use strict';

var db = require("./db.js");

module.exports.products = {};
module.exports.carts = {};

module.exports.products.update = (productJSON) => {
    try{
        var product = JSON.parse(productJSON);
    }catch(err){
        return Promise.reject("Invalid item JSON");
    }

    return new Promise((resolve,reject) => {
        if(!product.title || product.title == ""){
            reject("Invalid item title.");
        }
        if(!product.price || product.price < 0){
            reject("Invalid item price.");
        }
        if(!product.inventory_count || product.inventory_count < 0){
            reject("Invalid item inventory count.");
        }
        resolve(product);
    });
}

module.exports.products.query = (productQueryJSON) => {
    try{
        var productQuery = JSON.parse(productQueryJSON);
    }catch(err){
        return Promise.reject("Invalid item query.");
    }
    return new Promise((resolve,reject) => {
        if(!productQuery.query){
            reject("Invalid product search query.");
        }
        resolve(productQuery);
    });
}

module.exports.products.purchase = (productQueryJSON) => {
    return new Promise((resolve,reject) => {
        try{
            var productQuery = JSON.parse(productQueryJSON);
            resolve(productQuery);
        }catch(err){
            reject("Invalid item query.");
        }
    });
}

module.exports.carts.create = (userJSON) => {
    try{
        var user = JSON.parse(userJSON);
    }catch(err){
        return Promise.reject("Invalid user.");
    }
    
    return new Promise((resolve,reject) => {
        if(!user.username || user.username == ""){
            reject("Invalid username.");
        }

        resolve(user.username);
    }).then(db.carts.get)
    .then(userQuery => {
        if(userQuery){
            return Promise.reject(`The username '${user.username}' has already been taken. 😢`)
        }else{
            return user.username
        }
    });
}

module.exports.carts.info = (userJSON) => {
    try{
        var user = JSON.parse(userJSON);
    }catch(err){
        return Promise.reject("Invalid user.");
    }
    
    return new Promise((resolve,reject) => {
        if(!user.username || user.username == ""){
            reject("Invalid username.");
        }

        resolve(user.username);
    }).then(db.carts.get)
    .then(userQuery => {
        if(userQuery){
            return user.username
        }else{
            return Promise.reject(`The cart does not exist.`)
        }
    });
}

module.exports.carts.update = (requestJSON) => {
    try{
        var request = JSON.parse(requestJSON);
    }catch(err){
        return Promise.reject("Invalid request.");
    }
    if(!request.username || request.username == ""){
        return Promise.reject("Invalid username.");
    }
    if(!request.item || request.item == ""){
        return Promise.reject("Invalid item.");
    }

    return db.products.validate(request.item)
    .then((item) => {
        if(!item || item.inventory_count == 0){
            return Promise.reject("Item not available.")
        }else{
            return request
        }
    });
}

module.exports.carts.complete = (requestJSON) => {
    try{
        var user = JSON.parse(requestJSON);
    }catch(err){
        return Promise.reject("Invalid user.");
    }
    return new Promise((resolve,reject) => {
        if(!user.username || user.username == ""){
            reject("Invalid username.");
        }
        resolve(user);
    });
}