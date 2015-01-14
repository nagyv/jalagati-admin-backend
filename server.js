var server = require('./lib/index.js');
server.start(function () {
  console.log('Server running on port:', server.info.port);
});
