module.exports = {
  server: {
    "host": "127.0.0.1",
    "port": 8000
  },
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
    "crumb": {}
  },
  auth_strategy: {
    password: 'secret',
    cookie: 'sid',
    redirectTo: '/login',
    isSecure: false
  }
};
