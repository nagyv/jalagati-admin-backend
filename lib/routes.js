var auth = require('./controllers/auth')('/auth');
var jogasok = require('./controllers/jogasok')('/jogasok');
var alkalmak = require('./controllers/alkalmak')('/alkalmak');

module.exports = []
  .concat(auth)
  .concat(jogasok)
  .concat(alkalmak);
