'use strict';

var _ = require('lodash');
var Joi = require('joi');
var Boom = require('Boom');
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
    Alkalom.findById(req.params.alkalomId).exec(function(err, alkalom) {
      if (err) {
        reply({errors: err.errors});
      } else {
        reply(alkalom);
      }
    });
}

function updateAlkalom(req, reply) {
    var alkalom = req.pre.alkalom;
    alkalom = _.extend(alkalom, req.query || req.payload);
    alkalom.save(function(err, alkalom) {
      if(err) {
        reply(Boom.wrap(err));
      } else {
        reply(alkalom);
      }
    });
}

function closeAlkalom(req, reply) {
  req.pre.alkalom.close(function(err, alkalom){
    if(err) {
      reply(Boom.wrap(err));
    } else {
      reply(alkalom);
    }
  });
}

function addResztvevo(req, reply) {
  var jogas = req.pre.jogas;
  req.pre.alkalom.addResztvevo(jogas, function(err, alkalom) {
    if (err) {
      reply({error: err.errors});
    } else {
      reply(alkalom);
    }
  });
}

function removeResztvevo(req, reply) {
  req.pre.alkalom.removeResztvevo(req.query.resztvevoId, function(err){
    if (err) {
      reply({error: err.errors});
    } else {
      reply(req.pre.alkalom);
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
        handler: createAlkalom,
        validate: {
          payload: {
            starts: Joi.date(),
            location: Joi.string(),
            tartja: Joi.string().required(),
            segiti: Joi.string().required()
          }
        }
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
        }],
        validate: {
          payload: {
            starts: Joi.date(),
            location: Joi.string(),
            tartja: Joi.string().required(),
            segiti: Joi.string().required()
          }
        }
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
        ],
        validate: {
          query: {
            jogasId: Joi.string().alphanum().required()
          }
        }
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
          }
        ],
        validate: {
          query: {
            resztvevoId: Joi.string().alphanum().required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: prefix + '/{alkalomId}/close',
      config: {
        handler: closeAlkalom,
        cors: true,
        pre: [
          {
            method: egyAlkalom,
            assign: 'alkalom'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: prefix + '/{alkalomId}/saveFinal',
      config: {
        handler: updateAlkalom,
        cors: true,
        pre: [
          {
            method: egyAlkalom,
            assign: 'alkalom'
          }
        ],
        validate: {
          query: {
            nyito: Joi.number().integer().min(0).required(),
            zaro: Joi.number().integer().min(0).required(),
            extra: Joi.number().integer().min(0).required()
          }
        }
      }
    }
  ];
};
