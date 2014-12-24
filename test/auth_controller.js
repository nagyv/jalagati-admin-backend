'use strict';

var Lab = require('lab'),
  Hapi = require('hapi');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var after = Lab.after;

var server = require('../lib/');

describe('login', function() {

//    beforeEach(function (done) {
  //  done();
//    });

  it('works with correct password', function(done) {
    var options = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'josh',
        password: 'IamJosh'
      }
    };
    server.inject(options, function(response) {
      console.log(response.result);
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
