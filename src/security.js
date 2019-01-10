'use strict';

var JWT = require('jsonwebtoken');

const secrets = require('../secrets.json');
const options = {
    issuer: process.env.ISSUER
}

module.exports.userAuthorizer = (event, context, callback) => {
    const token = event.authorizationToken;

    try {
        const user = JWT.verify(token, secrets.jwtSecret);
        const effect = 'Allow';
        const userId = user.username;
        const authorizerContext = { user: JSON.stringify(user) };
        const policy = {
            principalId: userId,
            policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: event.methodArn,
                },
            ],
            },
            authorizerContext,
        };
        return callback(null, policy);
    } catch (e) {
      callback('Unauthorized');
    }  
}

module.exports.adminAuthorizer = (event, context, callback) => {
    if(event.authorizationToken === secrets.adminSecret){
        const effect = 'Allow';
        const authorizerContext = { user: JSON.stringify({
            user: 'admin'
        }) };
        const policy = {
            principalId: 'admin',
            policyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Action: 'execute-api:Invoke',
                  Effect: effect,
                  Resource: event.methodArn,
                },
              ],
            },
            authorizerContext,
          };
        return callback(null, policy);
    }else{
        return callback('Unauthorized');
    } 
}

module.exports.jwt = {};

module.exports.jwt.generate = (user) => {
    const payload = {
        username: user.username
    }

    return JWT.sign(payload, secrets.jwtSecret, options);
}

module.exports.jwt.validate = (user, token) => {
    const payload = JWT.verify(token,secrets.jwtSecret, options);

    if(payload.username !== user.username){
        return Promise.reject("Invalid username.")
    }else{
        return user;
    }
}
