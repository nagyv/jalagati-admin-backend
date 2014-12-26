module.exports = {
  "plugins": {
    "hapi-mongoose-db-connector": {
      mongodbUrl: "mongodb://localhost/test"
    },
    "hapi-auth-cookie": {},
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
    "crumb": {
      skip: function(){
        return true;
      }
    }
  },
  auth_strategy: {
    password: 'secret',
    cookie: 'sid',
    redirectTo: '/login',
    isSecure: false
  }
};

