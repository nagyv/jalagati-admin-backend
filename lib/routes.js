var auth = require('./controllers/auth')('/auth');
var jogasok = require('./controllers/jogasok')('/jogasok');
var alkalmak = require('./controllers/alkalmak')('/alkalmak');

module.exports = [{
    method: ['OPTIONS'],
    path: '/{p1*2}/{p2?}',
    config: {
      handler: function(req, reply){
        reply('');
      },
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      cors: true,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    }
}]
  .concat(auth)
  .concat(jogasok)
  .concat(alkalmak);
