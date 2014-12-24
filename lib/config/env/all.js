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
    "good": {},
    "crumb": {}
  },
  auth_strategy: {
    password: '',
    cookie: 'sid',
    isSecure: true,
    keepAlive: true
  }
};
