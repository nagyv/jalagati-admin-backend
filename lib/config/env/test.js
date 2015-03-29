module.exports = {
  'mailer': {
    user: 'viktor.nagy@gmail.com',
    pass: 'rAtssOvx9O-ZYJa7mrveNg'
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
    "crumb": {
      skip: function(){
        return true;
      }
    }
  }
};

