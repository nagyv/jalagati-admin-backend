var Lab = require('lab');

var mongoose = require('mongoose');
var it = Lab.test;
var expect = Lab.expect;
var server = require('../lib/');

var User = mongoose.model('User');
var Jogas = mongoose.model('Jogas');
var Alkalom = mongoose.model('Alkalom');

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

module.exports = {
  createUser: createUser,
  createJogas: createJogas,
  clearAllJogas: clearAllJogas,
  createAlkalom: createAlkalom,
  clearAllAlkalom: clearAllAlkalom,
  loggedInWrapper: loggedInWrapper,
  requiresLoginTest: requiresLoginTest
};
