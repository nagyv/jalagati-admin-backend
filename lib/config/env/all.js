var production_auth_strategy = {
    allowQueryToken: true,              // optional, true by default
    allowMultipleHeaders: false,        // optional, false by default
    accessTokenName: 'access_token',    // optional, 'access_token' by default
    validateFunc: function( token, callback ) {
      var mongoose = require('mongoose');
      var Boom = require('boom');
      var User = mongoose.model('User');

      User.find({token: token}, function(err, user) {
        if(err) {
          callback(err);
        } else if (!user) {
          callback(Boom.unauthorized('No such user'));
        } else {
          callback(null, true, { token: user.token });
        }
      });
    }
};

module.exports = {
  server: {
    "port": 8000
  },
  'managers': 'manager@example.com',
  'mailer': {
    user: null,
    pass: null
  },
  "plugins": {
    "hapi-mongoose-db-connector": {
      mongodbUrl: "mongodb://localhost/test"
    },
    "hapi-auth-bearer-token": {},
    "good": {},
    "crumb": {}
  },
  auth_registration_allowed: process.env.REGISTRATION_ALLOWED || true,
  auth_strategy: {'test': {
      allowQueryToken: true,              // optional, true by default
      allowMultipleHeaders: false,        // optional, false by default
      accessTokenName: 'access_token',    // optional, 'access_token' by default
      validateFunc: function( token, callback ) {

          // For convenience, the request object can be accessed
          // from `this` within validateFunc.
          var request = this;

          // TODO: Use a real strategy here,
          // comparing with a token from your database for example
          if(token === "1234"){
              callback(null, true, { token: token });
          } else {
              callback(null, false, { token: token });
          }
      }
  }, 'production': production_auth_strategy, 'development': production_auth_strategy},
  static_dir: null    // relative to index.js
};
