'use strict';

var _ = require('lodash');
var Joi = require('joi');
var Boom = require('boom');
var mongoose = require('mongoose'),
  Jogas = mongoose.model('Jogas'),
  Berlet = mongoose.model('Berlet');

function mindenJogas(req, reply) {
  Jogas.find().populate('alkalmak').sort('-created').exec(function (err, jogasok) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(jogasok);
    }
  });
}

function createJogas(req, reply) {
  var jogas = new Jogas(req.payload);
  jogas.save(function (err) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(jogas);
    }
  });
}

function egyJogas(req, reply) {
  var jogasId = req.params.jogasId || req.query.jogasId;
  Jogas.findById(jogasId, function (err, jogas) {
    if (err) {
      reply({errors: err.errors});
    } else if (!jogas) {
      reply(Boom.create(500, 'Jogas not found', {
        timestamp: Date.now(),
        jogasId: jogasId
      }));
    } else {
      reply(jogas);
    }
  });
}

function updateJogas(req, reply) {
  var jogas = req.pre.jogas;
  jogas = _.extend(jogas, req.payload);

  jogas.save(function (err) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(jogas);
    }
  });
}

function ujBerlet(req, reply) {
  var berlet = new Berlet(req.query);
  req.pre.jogas.berletek.push(berlet);
  req.pre.jogas.save(function (err, jogas) {
    if (err) {
      reply({errors: err.errors});
    } else {
      reply(jogas);
    }
  });
}

module.exports = function (prefix) {
  return [
    {
      method: 'GET',
      path: prefix,
      config: {
        handler: mindenJogas,
        cors: true
      }
    },
    {
      method: 'POST',
      path: prefix,
      config: {
        handler: createJogas,
        cors: true,
        validate: {
          payload: {
            name: Joi.string().required(),
            nick: Joi.string(),
            email: Joi.string().email(),
            city: Joi.string(),
            note: Joi.string()
          }
        }
      }
    },
    {
      method: 'GET',
      path: prefix + '/{jogasId}',
      config: {
        handler: egyJogas,
        cors: true
      }
    },
    {
      method: 'POST',
      path: prefix + '/{jogasId}',
      config: {
        handler: updateJogas,
        cors: true,
        pre: [
          {
            method: egyJogas,
            assign: 'jogas'
          }
        ],
        validate: {
          payload: {
            name: Joi.string().required(),
            nick: Joi.string(),
            email: Joi.string().email(),
            city: Joi.string(),
            note: Joi.string()
          }
        }
      }
    },
    {
      method: 'POST',
      path: prefix + '/{jogasId}/ujberlet',
      config: {
        handler: ujBerlet,
        cors: true,
        pre: [
          {
            method: egyJogas,
            assign: 'jogas'
          }
        ],
        validate: {
          query: {
            fizetett: Joi.number().integer().min(0).required(),
            startDate: Joi.date().iso(),
            endDate: Joi.date().iso(),
            alkalmak: Joi.number().min(0).integer()
          }
        }
      }
    }
  ];
};
