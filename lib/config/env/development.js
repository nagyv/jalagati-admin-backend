module.exports = {
  server: {
    "host": "127.0.0.1",
    "port": 8000
  },
  "plugins": {
    "hapi-mongoose-db-connector": {
      mongodbUrl: "mongodb://localhost/test"
    },
    "hapi-auth-bearer-token": {},
    "good": {
      opsInterval: 1000,
      reporters: [
        {
          reporter: require('good-console'),
          args: [
            { log: '*', response: '*' }
          ]
        }
      ]},
    "crumb": {}
  },
  auth_strategy: {
        allowQueryToken: true,              // optional, true by default
        allowMultipleHeaders: false,        // optional, false by default
        accessTokenName: 'access_token',    // optional, 'access_token' by default
        validateFunc: function( token, callback ) {

            // For convenience, the request object can be accessed
            // from `this` within validateFunc.
            var request = this;

            // Use a real strategy here,
            // comparing with a token from your database for example
            if(token === "1234"){
                callback(null, true, { token: token })
            } else {
                callback(null, false, { token: token })
            }
        }
    },
  static_dir: '../static'
};
