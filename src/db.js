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

module.exports.products.get = (productQuery) => {
    var params = {
        TableName: process.env.PRODUCTS_TABLE,
        Key: {
            title: productQuery.title
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