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
        context.succeed(generatePolicy(user.username, 'Allow', event.methodArn.split('/').slice(0, 2).join('/') + '/*'));
    } catch (e) {
        context.fail("Unauthorized");
    }  
}

module.exports.adminAuthorizer = (event, context, callback) => {
    if(event.authorizationToken === secrets.adminSecret){
        context.succeed(generatePolicy('admin', 'Allow', event.methodArn));
    }else{
        context.fail("Unauthorized");
    } 
}

const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
    }
    return authResponse;
  };

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
