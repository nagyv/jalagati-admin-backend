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
    async.series([
      function(cb){
        utils.createJogas(cb, function(err, _jogas){
          jogas = _jogas;
        });
      },
      function(cb){
        utils.buyBerlet(jogas, cb);
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
      method: 'GET',
      url: '/resztvevok/abcd'
    });

    it('returns a Resztvevo', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        method: 'GET',
        url: '/resztvevok/' + alkalom.resztvevok[0].resztvevo
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.berlet).to.be.truthy;
        expect(rsp.result.jogas.name).to.exist;
        expect(rsp.result.alkalom.starts).to.exist;
        done();
      });
    }));
  });

  describe('updateResztvevo', function(){
    utils.requiresLoginTest({
      method: 'POST',
      url: '/resztvevok/abcd/update'
    });

    it('updates a Resztvevo', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        method: 'POST',
        url: '/resztvevok/' + alkalom.resztvevok[0].resztvevo + '/update?fizetett=100'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.fizetett).to.equal(100);
        expect(rsp.result.jogas.name).to.exist;
        expect(rsp.result.alkalom.starts).to.exist;
        done();
      });
    }));
  });

  describe('removeBerlet', function(){
    utils.requiresLoginTest({
      method: 'POST',
      url: '/resztvevok/abcd/removeBerlet'
    });

    it('removes attached Berlet', utils.loggedInWrapper(function(header, done){
      var o = {
        headers: header,
        method: 'POST',
        url: '/resztvevok/' + alkalom.resztvevok[0].resztvevo + '/removeBerlet'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.berlet).to.be.null();
        done();
      });
    }));
  });
});
