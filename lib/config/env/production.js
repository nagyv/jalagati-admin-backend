module.exports = {
  server: {
    "port": process.env.PORT || 8000
  },
  "plugins": {
    "hapi-mongoose-db-connector": {
      mongodbUrl: process.env.MONGOLAB_URI
    },
    "hapi-auth-bearer-token": {},
    "hapi-raven": {
      dsn: process.env.SENTRY_DSN
    },
    "good": {
      opsInterval: 1000,
      reporters: [
        {
          reporter: require('good-console'),
          args: [
            { log: '*', response: '*' }
          ]
        },
        {
          reporter: require('good-http'),
          args: [
            { error: '*' },
            'http://prod.logs:3000',
            {
              threshold: 20,
              wreck: {
                headers: { 'x-api-key': 12345 }
              }
            }
          ]
        }
      ]},
    "crumb": {}
  },
  static_dir: '../static'
};
