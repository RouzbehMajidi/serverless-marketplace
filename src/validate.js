'use strict';

module.exports.products = {};

module.exports.products.update = (productJSON) => {
    try{
        var product = JSON.parse(productJSON);
    }catch(err){
        return Promise.reject("Invalid item JSON");
    }

    return new Promise((resolve,reject) => {
        if(!product.title || product.title == ""){
            reject("Invalid item title");
        }
        if(!product.price || product.price < 0){
            reject("Invalid item price");
        }
        if(!product.inventory_count || product.inventory_count < 0){
            reject("Invalid item inventory count");
        }
        resolve(product);
    });
}

module.exports.products.query = (productQueryJSON) => {
    try{
        var productQuery = JSON.parse(productQueryJSON);
    }catch(err){
        Promise.reject("Invalid item query");
    }
    return new Promise((resolve,reject) => {
        if(!productQuery.search){
            reject("Invalid product search query")
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
            reject("Invalid item query");
        }
    });
}