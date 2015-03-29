'use strict';

var Lab = require('lab');

var mongoose = require('mongoose');
var it = Lab.test;
var expect = Lab.expect;
var server = require('../lib/');

var User = mongoose.model('User');
var Jogas = mongoose.model('Jogas');
var Alkalom = mongoose.model('Alkalom');
var Berlet = mongoose.model('Berlet');

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
  Jogas.remove({}, function(){
    Berlet.remove({}, done);
  });
}
function getJogas(jogas, cb) {
  Jogas.findById(jogas._id, cb);
}

function buyBerlet(jogas, cb) {
  jogas.berletek.push(new Berlet({
    alkalmak: 10,
    fizetett: 1000
  }));
  jogas.save(cb);
}


function createAlkalom(done, cb) {
  Alkalom.create({
    starts: Date.now(),
    tartja: 'Yogi'
  }, function(err, jogas){
    if(!cb) {
      done();
    } else {
      cb(err, jogas);
      done();
    }
  });
}
function clearAllAlkalom(done) {
  Alkalom.remove({}, done);
}
function addResztvevo(jogas, alkalom, done) {
  alkalom.addResztvevo(jogas, done);
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
      var headers = { authorization: 'Bearer 1234'};
      testFunc(headers, done);
    });
  };
}

function requiresLoginTest(options) {
  it('requires login', function(done){
    server.inject(options, function (response) {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });
}

module.exports = {
  createUser: createUser,
  createJogas: createJogas,
  buyBerlet: buyBerlet,
  getJogas: getJogas,
  clearAllJogas: clearAllJogas,
  createAlkalom: createAlkalom,
  clearAllAlkalom: clearAllAlkalom,
  addResztvevo: addResztvevo,
  loggedInWrapper: loggedInWrapper,
  requiresLoginTest: requiresLoginTest
};
