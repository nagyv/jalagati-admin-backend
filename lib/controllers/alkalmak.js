'use strict';

var _ = require('lodash');
var config = require('../config/config');
var Joi = require('joi');
var Boom = require('boom');
var postman = require('../postman');
var mongoose = require('mongoose'),
  moment = require('moment'),
  jogasok = require('./jogasok')(''),
  Alkalom = mongoose.model('Alkalom'),
  Berlet = mongoose.model('Berlet');

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
    _.defaults(req.query, req.payload);
    alkalom = _.extend(alkalom, req.query);
    alkalom.save(function(err, alkalom) {
      if(err) {
        reply(Boom.wrap(err));
      } else {
        reply(alkalom);
      }
    });
}

/**
 * Creates a csv file from headers and data
 *
 * The headers should be an object of <header key>: <transformation function>
 * where the tranformation function receives one argument, the current data instance.
 *
 * @param headers
 * @param data
 * @param cb
 */
function createCSV(headers, data, cb) {
  var rows = _.map(data, function(b){
    return _.map(headers, function(fcn) {
      return fcn(b);
    });
  });
  var fileContent = new Buffer(
    [_.keys(headers).join(',')]
      .concat(rows)
      .join('\n'),
    'utf-8');
  cb(fileContent);
}

function closeAlkalom(req, reply) {
  req.pre.alkalom.close(function(err, alkalom){
    if(err) {
      reply(Boom.wrap(err));
    } else {
      Berlet.listActive(function(err, berletek){
        if(err) {
          console.log('Could not create attachment of Berletek');
        } else {
          var headers = {
            'name': function(b) {return b.name;},
            'nick': function(b) {return b.nick;},
            'city': function(b) {return b.city;},
            'alkalmak': function(b) {return b.berlet.alkalmak;},
            'kezdete': function(b) {return moment(b.berlet.startDate).format('YYYY. MM. DD.');},
            'vege': function(b) {return moment(b.berlet.endDate).format('YYYY. MM. DD.');},
            'felhasznalva': function(b) {
              if(b.berlet.felhasznalva) {
                return b.berlet.felhasznalva.length;
              } else {
                return 0;
              }
            }
          };
          createCSV(headers, berletek, function(attachment){
            postman.sendMail({
              to: config.managers,
              subject: 'Aktuális bérletek',
              text: 'Lásd a mellékletet',
              attachments: [
                {
                  filename: 'berletek.csv',
                  content: attachment
                }
              ]
            }, function(error, info){
              if(error){
                console.log(error);
              }else{
                console.log('Message sent: ' + info.response);
              }
            });
          });
        }
      });
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
