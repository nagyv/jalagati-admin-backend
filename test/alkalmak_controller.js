'use strict';

var Lab = require('lab'),
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

describe('Alkalmak Controller:', function() {

  before(function (done) {
    utils.createUser(done);
  });

  describe('mindenAlkalom', function(){
    utils.requiresLoginTest({
      url: '/alkalmak'
    });

    beforeEach(function(done){
      utils.createAlkalom(done);
    });
    afterEach(utils.clearAllAlkalom);

    it('returns all Alkalom', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.have.length(1);
        done();
      });
    }));
  });

  describe('createAlkalom', function(){
    utils.requiresLoginTest({
      url: '/alkalmak',
      method: 'POST'
    });

    it('create new Alkalom', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak',
        method: 'POST',
        payload: {
          starts: Date.now(),
          tartja: 'Very Cool'
        }
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.tartja).to.equal('Very Cool');
        done();
      });
    }));
  });

});
