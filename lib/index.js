/*
 * joga-admin
 * http://jalagati.hu
 *
 * Copyright (c) 2014 Viktor Nagy
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Hapi = require('hapi');

// Configurations
var config = require('./config/config');

// utility command to require files recursively from `path`
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};

var server = new Hapi.Server(process.env.NODE_ENV === 'development' ? { debug: { request: ['error'] } } : {});
server.connection(config.server);

var plugins = _.map(config.plugins, function(value, key){
  return {
    register: require(key),
    options: value
  };
});
server.register(plugins, function(err) {
  if(err) {
    console.log(err);
  } else {
    server.auth.strategy('session', 'bearer-access-token', 'required', config.auth_strategy[process.env.NODE_ENV]);

    //Bootstrap models
    var models_path = __dirname + '/models';
    walk(models_path);

//    server.route([{
//      method: 'HEAD',
//      path: '/crumb',
//      config: {
//        cors: true,
//        handler: function(req, reply) {
//          reply();
//        },
//        auth: {
//          mode: 'try',
//          strategy: 'session'
//        }
//      }
//    }]);
    server.route(require('./routes'));
    if (config.static_dir) {
      server.route([
        {
          method: 'GET',
          path: '/static/{param*}',
          config: {
            handler: {
              directory: {
                path: path.join(__dirname, config.static_dir),
                listing: true
              }
            },
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
          path: '/',
          config: {
            handler: function(req, reply){
              reply.redirect('/static');
            },
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
        }
      ]);
    }
    if (!module.parent) {
      server.start(function () {
        console.log('Server running on port:', server.info.port);
      });
    }
  }
});

module.exports = server;
