var Boom = require('boom');
var Joi = require('joi');
var config = require('../config/config');
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var login = function login(request, reply) {
  if (request.auth.isAuthenticated) {
    return reply(Boom.badRequest('you are already logged in'));
  }

  User.findOne({ username: request.payload.username }).exec(function(err, user){
    if(err) {
      reply(Boom.wrap(err));
    } else if(!user || !user.authenticate(request.payload.password)) {
      reply(Boom.unauthorized());
    } else {
      // TODO: create new token
      reply({
        id: user._id,
        name: user.username,
        token: user.token
      });
    }
  });
};

function signup(request, reply) {
  if (request.auth.isAuthenticated) {
    return reply(Boom.badRequest('you are already logged in'));
  }

  User.create(request.payload, function(err, user){
    if(err) {
      reply(Boom.wrap(err));
    } else {
      reply({
        id: user._id,
        name: user.username,
        token: user.token
      });
    }
  });
}

module.exports = function(prefix) {
  var routes = [
    {
      method: ['POST'],
      path: prefix + '/login',
      config: {
        handler: login,
        auth: {
          mode: 'try',
          strategy: 'session'
        },
        cors: true,
        validate: {
          payload: {
            username: Joi.string().alphanum().required(),
            password: Joi.string().alphanum().required()
          }
        }
      }
    }
  ];
  if(config.auth_registration_allowed) {
    routes.push({
      method: 'POST',
      path: prefix + '/signup',
      config: {
        handler: signup,
        auth: {
          mode: 'try',
          strategy: 'session'
        },
        cors: true,
        validate: {
          payload: function(pl, options, _next) {
            var validation = {
              username: Joi.string().alphanum().required(),
              password: Joi.string().alphanum().required(),
              password2: Joi.string().alphanum().required()
            };
            var next = function(err, values) {
              if(err) {
                _next(err, values);
              } else if (pl.password !== pl.password2) {
                _next(Boom.badRequest('Passwords do not match'));
              } else {
                _next(err, values);
              }
            };
            Joi.validate(pl, validation, next);
          }
        }
      }
    });
  }
  return routes;
};
