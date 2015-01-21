'use strict';

var Lab = require('lab'),
  async = require('async'),
  sinon = require('sinon'),
  Hapi = require('hapi');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var after = Lab.after;

var server = require('../lib/');
var utils = require('./utils');

describe('Resztvevok Controller', function(){
  var jogas, alkalom, resztvevo;

  before(function (done) {
    utils.createUser(done);
  });
  beforeEach(function(done){
    async.parallel([
      function(cb){
        utils.createJogas(cb, function(err, _jogas){
          jogas = _jogas;
        });
      },
      function(cb){
        utils.createAlkalom(cb, function(err, _alkalom){
          alkalom = _alkalom;
        });
      }
    ], function(){
      utils.addResztvevo(jogas, alkalom, done);
    });
  });
  afterEach(utils.clearAllJogas);
  afterEach(utils.clearAllAlkalom);

  describe('egyResztvevo', function(){
    utils.requiresLoginTest({
      method: 'POST',
      url: '/resztvevok/abcd/update'
    });

    it('returns one Resztvevo', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        method: 'POST',
        url: '/resztvevok/' + alkalom.resztvevok[0].resztvevo + '/update'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.jogas.name).to.exist;
        expect(rsp.result.alkalom.starts).to.exist;
        done();
      });
    }));
  });
});
