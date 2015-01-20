module.exports = {
  server: {
    "host": "127.0.0.1",
    "port": 8000
  },
  "plugins": {
    "hapi-mongoose-db-connector": {
      mongodbUrl: "mongodb://localhost/jogaadmin"
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
    "crumb": {
      skip: function(){
        return true;
      }
    }
  },
  static_dir: '../static'
};
