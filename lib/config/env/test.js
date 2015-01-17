module.exports = {
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
    "crumb": {
      skip: function(){
        return true;
      }
    }
  }
};

