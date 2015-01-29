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
          tartja: 'Very Cool',
          location: 'Valahol',
          segiti: 'valaki'
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

  describe('egyAlkalom', function(){
    var alkalom;

    beforeEach(function(done){
      utils.createAlkalom(done, function(err, _alkalom){
        alkalom = _alkalom;
      });
    });
    afterEach(utils.clearAllAlkalom);

    utils.requiresLoginTest({
      url: '/alkalmak/abcd'
    });

    it('returns one Alkalom', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak/' + alkalom._id
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.tartja).to.equal('Yogi');
        done();
      });
    }));
  });

  describe('updateAlkalom', function(){
    var alkalom;
    beforeEach(function(done){
      utils.createAlkalom(done, function(err, _alkalom){
        alkalom = _alkalom;
      });
    });
    afterEach(utils.clearAllAlkalom);

    utils.requiresLoginTest({
      url: '/alkalmak/abcd',
      method: 'POST',
      payload: {
        starts: Date.now()
      }
    });

    it('updates the Alkalom', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak/' + alkalom._id,
        method: 'POST',
        payload: {
          tartja: 'Big Buddha',
          starts: alkalom.starts,
          location: 'Valahol',
          segiti: 'valaki'
        }
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.tartja).to.equal('Big Buddha');
        done();
      });
    }));
  });

  describe('close', function(){
    var alkalom;
    beforeEach(function(done){
      utils.createAlkalom(done, function(err, _alkalom){
        alkalom = _alkalom;
      });
    });

    utils.requiresLoginTest({
      url: '/alkalmak/abcd/close',
      method: 'POST',
      payload: {}
    });

    it('calls alkalom.close', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak/' + alkalom._id + '/close',
        method: 'POST',
        payload: {}
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.state).to.be.equal('closed');
        done();
      });
    }));
  });

  describe('addResztvevo', function(){
    var alkalom, jogas;
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
      ], done);
    });
    afterEach(function(done){
      async.parallel([
        utils.clearAllAlkalom,
        utils.clearAllJogas
      ], done);
    });

    utils.requiresLoginTest({
      url: '/alkalmak/abcd/addResztvevo',
      method: 'POST',
      payload: {}
    });

    it('adds a resztvevo', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak/' + alkalom._id + '/addResztvevo?jogasId=' + jogas._id,
        method: 'POST'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.starts).to.be.exist;  // we have an Alkalom
        expect(rsp.result.resztvevok).to.have.length(1);
        done();
      });
    }));

    it('uses Berlet if Jogas has one', utils.loggedInWrapper(function(headers, done){
      // preparations for the test
      async.series([
        // buy Berlet
        function(cb){
          utils.buyBerlet(jogas, cb);
        },
        // call the backend
        function(cb){
          var o = {
            headers: headers,
            url: '/alkalmak/' + alkalom._id + '/addResztvevo?jogasId=' + jogas._id,
            method: 'POST'
          };
          server.inject(o, function(rsp){
            expect(rsp.statusCode).to.equal(200);
            expect(rsp.result).to.be.a('object');
            expect(rsp.result.starts).to.be.exist;  // we have an Alkalom
            expect(rsp.result.resztvevok).to.have.length(1);
            cb();
          });
        },
        // refresh the jogas' data
        function(cb) {
          utils.getJogas(jogas, cb);
        }
      ], function(err, stuff){
        if(err) {done(err);}

        // this is the real test
        var _jogas = stuff[2];
        expect(_jogas.berlet.felhasznalva).to.have.length(1);

        done();
      });
    }));
  });

  describe('removeResztvevo', function(){
    var alkalom, jogas;

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
    it('removes jogas from alkalom', utils.loggedInWrapper(function(headers, done){
      var o = {
        headers: headers,
        url: '/alkalmak/' + alkalom._id + '/removeResztvevo?resztvevoId=' + jogas._id,
        method: 'POST'
      };
      server.inject(o, function(rsp){
        expect(rsp.statusCode).to.equal(200);
        expect(rsp.result).to.be.a('object');
        expect(rsp.result.starts).to.be.exist;  // we have an Alkalom
        done();
      });
    }));
  });
});
