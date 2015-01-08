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

describe('Jogas Controller:', function() {

  before(function (done) {
    utils.createUser(done);
  });

  describe('createJogas', function() {
    utils.requiresLoginTest({
      method: 'POST',
      url: '/jogasok'
    });

    it('creates new Jogas', utils.loggedInWrapper(function(headers, done){
      var options = {
        headers: headers,
        method: 'POST',
        url: '/jogasok',
        payload: {
          name: 'Suffering John'
        }
      };
      server.inject(options, function(response){
        expect(response.statusCode).to.equal(200);
        expect(response.result).is.a('object');
        expect(response.result.name).to.equal('Suffering John');
        done();
      });
    }));

    after(function(done){
      utils.clearAllJogas(done);
    });

  });

  describe('mindenJogas', function () {
    utils.requiresLoginTest({
        method: 'GET',
        url: '/jogasok'
      });

    beforeEach(function(done){
      utils.createJogas(done);
    });
    afterEach(function(done){
      utils.clearAllJogas(done);
    });

    it('returns everyone', utils.loggedInWrapper(function (headers, done) {
      var options = {
        method: 'GET',
        url: '/jogasok',
        headers: headers
      };
      server.inject(options, function (response) {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.have.length(1);
        expect(response.result[0].name).to.equal('My dear friend');
        done();
      });
    }));

  });

  describe('egyJogas', function(){
    var jogasId;
    utils.requiresLoginTest({
      method: 'GET',
      url: '/jogasok/abcd'
    });

    beforeEach(function(done){
      utils.createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      utils.clearAllJogas(done);
    });

    it('returns the requested jogas', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/jogasok/' + jogasId
      };
      server.inject(o, function(resp){
        expect(resp.statusCode).to.equal(200);
        expect(resp.result).to.be.a('object');
        expect(resp.result.name).to.equal('My dear friend');
        done();
      });
    }));
  });

  describe('updateJogas', function(){
    var jogasId;
    utils.requiresLoginTest({
      method: 'POST',
      url: '/jogasok/abcd'
    });

    beforeEach(function(done){
      utils.createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      utils.clearAllJogas(done);
    });

    it('returns the requested jogas', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        method: 'POST',
        url: '/jogasok/' + jogasId,
        payload: {
          name: 'Hulk'
        }
      };
      server.inject(o, function(resp){
        expect(resp.statusCode).to.equal(200);
        expect(resp.result).to.be.a('object');
        expect(resp.result.name).to.equal('Hulk');
        done();
      });
    }));
  });

  describe('ujBerlet', function(){
    var jogasId;
    beforeEach(function(done){
      utils.createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      utils.clearAllJogas(done);
    });

    utils.requiresLoginTest({
      method: 'POST',
      url: '/jogasok/abcd/ujberlet',
      payload: {
        alkalmak: 10
      }
    });

    it('creates a new Berlet for Jogas', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        method: 'POST',
        url: '/jogasok/' + jogasId + '/ujberlet',
        payload: {
          alkalmak: 10
        }
      };
      server.inject(o, function(resp){
        expect(resp.statusCode).to.equal(200);
        expect(resp.result).to.be.a('object');
        expect(resp.result.berletek).to.have.length(1);
        expect(resp.result.berletek[0].alkalmak).to.equal(10);
        done();
      });
    }));
  });
});
