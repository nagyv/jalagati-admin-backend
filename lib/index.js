/*
 * joga-admin
 * http://jalagati.hu
 *
 * Copyright (c) 2014 Viktor Nagy
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var Hapi = require('hapi');

// Configurations
var config = require('./config/config');

var server = new Hapi.Server(process.env.NODE_ENV === 'development' ? { debug: { request: ['error'] } } : {});
server.connection(config.server);

var plugins = _.map(config.plugins, function(value, key, plugins){
  return {
    register: require(key),
    options: value
  };
});
server.register(plugins, function(err) {
  if(err) {
    console.log(err);
  } else {
    server.auth.strategy('session', 'cookie', 'required', config.auth_strategy);
    server.route(require('./routes'));
    if (!module.parent) {
      server.start(function () {
        console.log('Server running on port:', server.info.port);
      });
    }
  }
});

module.exports = server;
