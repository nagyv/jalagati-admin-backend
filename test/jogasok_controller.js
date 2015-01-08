'use strict';

var Lab = require('lab'),
  mongoose = require('mongoose'),
  Hapi = require('hapi');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var after = Lab.after;

var server = require('../lib/');

var User = mongoose.model('User');
var Jogas = mongoose.model('Jogas');

function createUser(done) {
  User.create({
      name: 'Full name',
      email: 'test@test.com',
      username: 'josh',
      password: 'IamJosh'
  }, done);
}

function createJogas(done, cb) {
  Jogas.create({
    name: 'My dear friend'
  }, function(err, jogas){
    if(!cb) {
      done();
    } else {
      cb(err, jogas);
      done();
    }
  });
}
function clearAllJogas(done) {
  Jogas.remove({}, done);
}

function loggedInWrapper(testFunc) {
  return function wrapped(done) {
    var options = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'josh',
        password: 'IamJosh'
      }
    };
    server.inject(options, function(response) {
      expect(response.statusCode).to.equal(200);
      var cookie = response.headers['set-cookie'][0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
      var headers = { cookie: 'sid=' + cookie[1] };
      testFunc(headers, done);
    });
  };
}

function requiresLoginTest(options) {
  it('requires login', function(done){

    server.inject(options, function (response) {
      expect(response.statusCode).to.equal(302);
      done();
    });
  });
}

describe('Jogas Controller:', function() {

  before(function (done) {
    createUser(done);
  });

  describe('createJogas', function() {
    requiresLoginTest({
      method: 'POST',
      url: '/jogasok'
    });

    it('creates new Jogas', loggedInWrapper(function(headers, done){
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
      clearAllJogas(done);
    });

  });

  describe('mindenJogas', function () {
    requiresLoginTest({
        method: 'GET',
        url: '/jogasok'
      });

    beforeEach(function(done){
      createJogas(done);
    });
    afterEach(function(done){
      clearAllJogas(done);
    });

    it('returns everyone', loggedInWrapper(function (headers, done) {
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
    requiresLoginTest({
      method: 'GET',
      url: '/jogasok/abcd'
    });

    beforeEach(function(done){
      createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      clearAllJogas(done);
    });

    it('returns the requested jogas', loggedInWrapper(function(headers, done){
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
    requiresLoginTest({
      method: 'POST',
      url: '/jogasok/abcd'
    });

    beforeEach(function(done){
      createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      clearAllJogas(done);
    });

    it('returns the requested jogas', loggedInWrapper(function(headers, done){
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
      createJogas(done, function(err, jogas) {
        if(!err) {
          jogasId = jogas._id;
        }
      });
    });
    afterEach(function(done){
      clearAllJogas(done);
    });

    requiresLoginTest({
      method: 'POST',
      url: '/jogasok/abcd/ujberlet',
      payload: {
        alkalmak: 10
      }
    });

    it('creates a new Berlet for Jogas', loggedInWrapper(function(headers, done){
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
