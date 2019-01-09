'use strict';

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var DynamoClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

module.exports.products = {};

module.exports.products.update = (product) => {
    var params = {
        TableName: process.env.PRODUCTS_TABLE,
        Item: product
    }
    return new Promise((resolve,reject) => {
        DynamoClient.put(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(product);
            }
        });
    });
}

module.exports.products.get = (productTitle) => {
    var params = {
        TableName: process.env.PRODUCTS_TABLE,
        Key: {
            title: productTitle
        }
    };
    return new Promise((resolve,reject) => {
        DynamoClient.get(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(data.Item);
            }
        });
    });
}

module.exports.products.validate = (productTitle) => {
    var params = {
        TableName: process.env.PRODUCTS_TABLE,
        Key: {
            title: productTitle
        }
    };
    return new Promise((resolve,reject) => {
        DynamoClient.get(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(data.Item);
            }
        });
    });
}

module.exports.products.query = (productQuery) => {
    var params = {
        TableName : process.env.PRODUCTS_TABLE,
    };
    if(productQuery.onlyShowAvailable){
        params.FilterExpression =  "contains (title, :title) and inventory_count > :count";
        params.ExpressionAttributeValues =  {
            ":title" : productQuery.search,
            ":count" : 0
        }
    }else{
        params.FilterExpression =  "contains (title, :title)",
        params.ExpressionAttributeValues =  {
            ":title" : productQuery.search
        }
    }
    return new Promise((resolve,reject) => {
        DynamoClient.scan(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(data.Items);
            }
        });
    });
}

module.exports.products.getAll = () => {
    var params = {
        TableName : process.env.PRODUCTS_TABLE
    };
    return new Promise((resolve,reject) => {
        DynamoClient.scan(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(data.Items);
            }
        });
    });
}

module.exports.carts = {};

module.exports.carts.create = (username) => {
    var user = {
        username: username,
        cart: {}
    }
    
    var params = {
        TableName: process.env.CARTS_TABLE,
        Item: user
    }
    return new Promise((resolve,reject) => {
        DynamoClient.put(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(user);
            }
        });
    });
}

module.exports.carts.get = (username) => {
    var params = {
        TableName: process.env.CARTS_TABLE,
        Key: {
            username: username
        }
    };
    return new Promise((resolve,reject) => {
        DynamoClient.get(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                if(data.Item){
                    resolve(data.Item);
                }else{
                    reject("Cart does not exist");
                }
            }
        });
    });
}

module.exports.carts.update = (user) => {
    var params = {
        TableName: process.env.CARTS_TABLE,
        Item: user
    };
    console.log(user)
    return new Promise((resolve,reject) => {
        DynamoClient.put(params, (err, data) =>{
            if(err){
                reject(err);
            }else{
                resolve(user);
            }
        });
    });
}
