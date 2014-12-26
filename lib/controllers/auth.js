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
      request.auth.session.set(user);
      reply('success');
    }
  });

};

var logout = function logout(request, reply) {
  request.auth.session.clear();
  reply('success');
};

module.exports = function(prefix) {
  return [
    {
      method: 'POST',
      path: prefix + '/login',
      config: {
        handler: login,
        auth: {
          mode: 'try',
          strategy: 'session'
        },
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
        handler: logout
      }
    }
  ];
};
