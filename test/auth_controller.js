'use strict';

var Lab = require('lab'),
  mongoose = require('mongoose'),
  Hapi = require('hapi');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var after = Lab.after;

var server = require('../lib/');

var User = mongoose.model('User');

var utils = require('./utils');

describe('Auth Controller:', function(){

  before(function(done){
    utils.createUser(done);
  });

  describe('login', function() {

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
        expect(response.statusCode).to.equal(200);
        expect(response.result.name).to.equal('josh');
        expect(response.result.password).to.not.exist;
        expect(response.result.id).to.exist;
        done();
      });
    });

    it('fails on wrong password', function(done){
      var options = {
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'josh',
          password: 'hulu'
        }
      };
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('fails on wrong user', function(done){
      var options = {
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'paul',
          password: 'IamJosh'
        }
      };
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('returns when logged in', function(done){
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

        options.headers = { authorization: 'Bearer 1234'};
        server.inject(options, function(response) {
          expect(response.statusCode).to.equal(400);
          done();
        });
      });
    });
  });

//  describe('logout', function() {
//
//    it('clears the session', function(done){
//      var options = {
//        method: 'POST',
//        url: '/auth/login',
//        payload: {
//          username: 'josh',
//          password: 'IamJosh'
//        }
//      };
//      server.inject(options, function(response) {
//        expect(response.statusCode).to.equal(200);
//        var cookie = response.headers['set-cookie'][0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
//
//        options.method = 'GET';
//        options.headers = { cookie: 'sid=' + cookie[1] };
//        options.url = '/auth/logout';
//        server.inject(options, function(response) {
//          expect(response.statusCode).to.equal(200);
//          expect(response.result).to.equal('success');
//          done();
//        });
//      });
//    });
//  });

  describe('signup', function(){
    it('creates new User', function(done){
      var o = {
        method: 'POST',
        url: '/auth/signup',
        payload: {
          username: 'jane',
          password: 'IamJane',
          password2: 'IamJane'
        }
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result.name).to.equal('jane');
        expect(rsp.result.password).to.not.exist;
        expect(rsp.result.id).to.exist;
        expect(rsp.result.token).to.exist;
        done();
      });
    });
  });

  after(function (done) {
    User.remove().exec();
    done();
  });

});
