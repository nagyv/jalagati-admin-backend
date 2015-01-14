var _ = require('lodash');
var Joi = require('joi');
var mongoose = require('mongoose'),
  jogasok = require('./jogasok')(''),
  Alkalom = mongoose.model('Alkalom');

var egyJogas = _.filter(jogasok, function(route){
  return route.path === '/{jogasId}';
})[0].config.handler;

function mindenAlkalom(req, reply) {
  Alkalom.find().sort('-created').limit(10).select('tartja segiti location starts').exec(function (err, alkalmak) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(alkalmak);
    }
  });
}

function createAlkalom(req, reply) {
  var alkalom = new Alkalom(req.payload);

  alkalom.save(function (err) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(alkalom);
    }
  });
}

function egyAlkalom(req, reply) {
    Alkalom.findById(req.params.alkalomId).populate('resztvevok', 'name nick').exec(function(err, alkalom) {
      if (err) {
        reply({errors: err.errors});
      } else {
        reply(alkalom);
      }
    });
}

function updateAlkalom(req, reply) {
    var alkalom = req.pre.alkalom;
    alkalom = _.extend(alkalom, req.payload);
    alkalom.save(function(err, alkalom) {
      reply(alkalom);
    });
}

function addResztvevo(req, reply) {
  var jogas = req.pre.jogas;
  req.pre.alkalom.addResztvevo(jogas, function(err, alkalom) {
    if (err) {
      reply({error: err.errors});
    } else {
      Alkalom.populate(alkalom, {
        path: 'resztvevok'
      }, function(err, alkalom){
        reply(alkalom);
      });
    }
  });
}

function removeResztvevo(req, reply) {
  var jogas = req.pre.jogas;
  console.log(jogas);
  req.pre.alkalom.removeResztvevo(jogas, function(err, alkalom){
    console.log(alkalom);
    if (err) {
      reply({error: err.errors});
    } else {
      reply(alkalom);
    }
  });
}

module.exports = function (prefix) {
  return [
    {
      method: 'GET',
      path: prefix,
      config: {
        cors: true,
        handler: mindenAlkalom
      }
    },
    {
      method: 'POST',
      path: prefix,
      config: {
        cors: true,
        handler: createAlkalom
      }
    },
    {
      method: 'GET',
      path: prefix + '/{alkalomId}',
      config: {
        cors: true,
        handler: egyAlkalom
      }
    },
    {
      method: 'POST',
      path: prefix + '/{alkalomId}',
      config: {
        handler: updateAlkalom,
        cors: true,
        pre: [{
          method: egyAlkalom,
          assign: 'alkalom'
        }]
      }
    },
    {
      method: 'POST',
      path: prefix + '/{alkalomId}/addResztvevo',
      config: {
        handler: addResztvevo,
        cors: true,
        pre: [
          {
            method: egyAlkalom,
            assign: 'alkalom'
          },
          {
            method: egyJogas,
            assign: 'jogas'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: prefix + '/{alkalomId}/removeResztvevo',
      config: {
        handler: removeResztvevo,
        cors: true,
        pre: [
          {
            method: egyAlkalom,
            assign: 'alkalom'
          },
          {
            method: egyJogas,
            assign: 'jogas'
          }
        ]
      }
    }
  ];
};
