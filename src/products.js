'use strict';

var validate = require('./validate.js');
var db = require('./db.js')

//Create/update products handler
module.exports.update = async (event) => {
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

//Get all products handler
module.exports.getAll = async () => {
    return await db.products.getAll()
        .then(items => {
            let response = {
                statusCode: 200
            }
            if (items.length == 0) {
                response.body = JSON.stringify({
                    message: "No products available. ☹️"
                })
            } else {
                response.body = JSON.stringify({
                    message: `There are currently ${items.length} item(s) in the marketplace.`,
                    items: items
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

//Query all products handler
module.exports.query = async (event) => {
    return await validate.products.query(event.body)
        .then(db.products.query)
        .then(items => {
            let response = {
                statusCode: 200
            }
            if (items.length == 0) {
                response.body = JSON.stringify({
                    message: "No products match search query."
                })
            } else {
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