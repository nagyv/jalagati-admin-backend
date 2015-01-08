var Joi = require('joi');
var mongoose = require('mongoose'),
    Alkalom = mongoose.model('Alkalom');

function mindenAlkalom(req, reply) {
  Alkalom.find().sort('-created').limit(10).select('tartja segiti location starts').exec(function(err, alkalmak) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(alkalmak);
    }
  });
}

function createAlkalom(req, reply) {
    var alkalom = new Alkalom(req.payload);

    alkalom.save(function(err) {
      if (err) {
        reply({errors: err.errors});
      } else {
        reply(alkalom);
      }
    });
}

module.exports = function(prefix) {
  return [
    {
      method: 'GET',
      path: prefix,
      handler: mindenAlkalom
    },
    {
      method: 'POST',
      path: prefix,
      handler: createAlkalom
    }
  ];
};
