var Boom = require('boom');
var Joi = require('joi');

var users = {
  'josh': {
    name: 'Josh',
    password: 'IamJosh',
    age: 12
  }
};

var login = function login(request, reply) {
  console.info('inside login');
  if (request.auth.isAuthenticated) {
    return reply(Boom.badRequest('you are already logged in'));
  }

  var account = users[request.payload.username];
  console.log(account, account.password);
  if (!account ||
    account.password !== request.payload.password) {
    reply(Boom.unauthorized());
  } else {
    request.auth.session.set(account);
    reply('success');
  }

};

var logout = function logout(request, reply) {
  console.log('logout');
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
        }
      }
    },
    {
      method: 'GET',
      path: prefix + '/logout',
      config: {
        handler: logout,
        auth: 'session'
      }
    }
  ];
};
