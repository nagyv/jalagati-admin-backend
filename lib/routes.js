var auth = require('./controllers/auth')('/auth');
var jogasok = require('./controllers/jogasok')('/jogasok');

module.exports = []
  .concat(auth)
  .concat(jogasok);
