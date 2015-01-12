var Boom = require('boom');
var Joi = require('joi');
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
        token: 1234
      });
    }
  });
};

var logout = function logout(request, reply) {
// TODO: invalidate token
  reply('success');
};

function signup(request, reply) {
  if (request.auth.isAuthenticated) {
    return reply(Boom.badRequest('you are already logged in'));
  }

  User.create(request.payload, function(err, user){
    if(err) {
      reply(Boom.wrap(err));
    } else {
      request.auth.session.set(user);
      reply({
        id: user._id,
        name: user.username
      });
    }
  });
}

module.exports = function(prefix) {
  return [
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
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        validate: {
          payload: {
            username: Joi.string().alphanum().required(),
            password: Joi.string().alphanum().required()
          }
        }
      }
    },
    {
      method: 'GET',
      path: prefix + '/logout',
      config: {
        handler: logout,
        cors: true
      }
    },
    {
      method: 'POST',
      path: prefix + '/signup',
      config: {
        handler: signup,
        auth: {
          mode: 'try',
          strategy: 'session'
        },
        cors: true,
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
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
    }
  ];
};
