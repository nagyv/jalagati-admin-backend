var _ = require('lodash');
var Joi = require('joi');
var mongoose = require('mongoose'),
    Jogas = mongoose.model('Jogas'),
    Berlet = mongoose.model('Berlet');

function mindenJogas (req, reply) {
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
  jogas.save(function(err) {
      if (err) {
          reply({errors: err.errors});
      } else {
          reply(jogas);
      }
  });
}

function egyJogas(req, reply) {
  Jogas.findById(req.params.jogasId, function(err, jogas) {
      if (err) {
          reply({errors: err.errors});
      } else {
          reply(jogas);
      }
  });
}

function updateJogas(req, reply) {
  var jogas = req.pre.jogas;

    jogas = _.extend(jogas, req.payload);

    jogas.save(function(err) {
      if (err) {
          reply({errors: err.errors});
      } else {
          reply(jogas);
      }
    });
}

function ujBerlet(req, reply) {
  var berlet = new Berlet(req.payload);
  berlet.save(function(err, berlet){
    if (err) {
        reply({errors: err.errors});
    } else {
      req.pre.jogas.berletek.push(berlet);
      req.pre.jogas.save(function(err, jogas){
        if (err) {
            reply({errors: err.errors});
        } else {
            reply(jogas);
        }
      });
    }
  });
}

module.exports = function(prefix) {
  return [
    {
      method: 'GET',
      path: prefix,
      handler: mindenJogas
    },
    {
      method: 'POST',
      path: prefix,
      handler: createJogas
    },
    {
      method: 'GET',
      path: prefix + '/{jogasId}',
      handler: egyJogas
    },
    {
      method: 'POST',
      path: prefix + '/{jogasId}',
      config: {
        handler: updateJogas,
        pre: [{
          method: egyJogas,
          assign: 'jogas'
        }]
      }
    },
    {
      method: 'POST',
      path: prefix + '/{jogasId}/ujberlet',
      config: {
        handler: ujBerlet,
        pre: [{
          method: egyJogas,
          assign: 'jogas'
        }]
      }
    }
  ];
};
