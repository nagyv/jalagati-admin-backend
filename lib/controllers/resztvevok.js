'use strict';

var _ = require('lodash');
var Joi = require('joi');
var Boom = require('boom');
var mongoose = require('mongoose'),
  Resztvevo = mongoose.model('Resztvevo');

function allResztvevo(req, reply) {
  Resztvevo.find(req.query).populate('jogas').exec(function(err, resztvevok){
    if (err) {
      reply(Boom.wrap(err));
    } else {
      reply(resztvevok);
    }
  });
}

function egyResztvevo(req, reply) {
  Resztvevo.findById(req.params.resztvevoId)
    .populate('jogas alkalom')
    .exec(function (err, resztvevo) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(resztvevo);
    }
  });
}

function updateResztvevo(req, reply) {
  var resztvevo = req.pre.resztvevo;
  resztvevo = _.extend(resztvevo, req.query);
  resztvevo.save(function (err, resztvevo) {
    if(err) {
      reply(err);
    } else {
      reply(resztvevo);
    }
  });
}

function removeBerlet(req, reply) {
  var resztvevo = req.pre.resztvevo;
  resztvevo.restoreBerlet(function (err, resztvevo) {
    if(err) {
      reply(err);
    } else {
      reply(resztvevo);
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
        handler: allResztvevo
      }
    },
    {
      method: 'GET',
      path: prefix + '/{resztvevoId}',
      config: {
        cors: true,
        handler: egyResztvevo
      }
    },
    {
      method: 'POST',
      path: prefix + '/{resztvevoId}/update',
      config: {
        cors: true,
        handler: updateResztvevo,
        pre: [
          {
            method: egyResztvevo,
            assign: 'resztvevo'
          }
        ],
        validate: {
          query: {
            fizetett: Joi.number().min(0).integer().required(),
            torulkozo: Joi.boolean(),
            szamla: Joi.boolean(),
            kupon: Joi.boolean(),
            note: Joi.string()
          }
        }
      }
    },
    {
      method: 'POST',
      path: prefix + '/{resztvevoId}/removeBerlet',
      config: {
        cors: true,
        handler: removeBerlet,
        pre: [
          {
            method: egyResztvevo,
            assign: 'resztvevo'
          }
        ]
      }
    }
  ];
};
