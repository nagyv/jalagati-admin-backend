/**
 * Module dependencies.
 */
var Lab = require('lab'),
  server = require('../lib/'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Berlet = mongoose.model('Berlet'),
  Jogas = mongoose.model('Jogas');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var after = Lab.after;

//Globals
var jogas;
var berlet;

//The tests
describe('Model Jogas:', function () {
  beforeEach(function (done) {
    jogas = new Jogas({
      name: 'Kiss Attila',
      nick: 'kicsi'
    });
    done();
  });

  it('should be able to save without problems', function (done) {
    return jogas.save(function (err) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('should be able to show an error when try to save without name', function (done) {
    jogas.name = '';

    return jogas.save(function (err) {
      expect(err).to.exist;
      done();
    });
  });

  it('does not have a berlet by default', function(done){
    jogas.save(function(err, jogas){
      expect(err).to.not.exist;
      expect(jogas.berlet).to.be.false();
      done();
    });
  });
  it('has the first valid berlet selected', function(done){
    berlet = {
      alkalmak: 10
    };
    jogas.berletek.push(berlet);
    jogas.berletek.push({
      alkalmak: 5
    });
    jogas.save(function(err, jogas){
      expect(err).to.not.exist;
      expect(jogas.berlet.alkalmak).to.be.equal(berlet.alkalmak);
      done();
    });
  });

  it('can register an alkalom', function(done){
    jogas.addAlkalom(Date.now(), function(err, cb){
      expect(err).to.not.exist;
      expect(jogas.alkalmak).to.have.length(1);
      done();
    });
  });

  describe('Model Berlet', function () {
    beforeEach(function (done) {
      berlet = new Berlet({
        alkalmak: 10
      });
      done();
    });
    it('has path berlet', function (done) {
      berlet.save(function (err) {
        expect(err).to.not.exist;
        jogas.berletek.push(berlet);
        expect(jogas.berlet.id).to.be.equal(berlet.id);
        done();
      });
    });
    it('can be attached to a Jogas', function (done) {
      berlet.save(function (err) {
        expect(err).to.not.exist;
        jogas.berletek.push(berlet);
        jogas.save(function (err) {
          expect(err).to.not.exist;
          done();
        });
      });
    });
    it('can be used up if valid', function (done) {
      berlet.save(function (err) {
        expect(err).to.not.exist;
        berlet.hasznal(Date.now(), function (err, berlet) {
          expect(err).to.not.exist;
          expect(berlet).to.exist;
          expect(berlet.felhasznalva).to.have.length(1);
          done();
        });
      });
    });
    it('can not be used if inValid', function (done) {
      berlet.alkalmak = 1;
      berlet.felhasznalva = [Date.now()];
      berlet.save(function (err) {
        berlet.hasznal(Date.now(), function (err) {
          expect(err).to.exist;
          done();
        });
      });
    });
    describe('alkalomra', function () {
      it('is valid if has alkalom', function (done) {
        expect(berlet.isValid()).to.be.true();
        done();
      });
      it('is not valid if has no more alkalom', function (done) {
        berlet.alkalmak = 1;
        berlet.felhasznalva = [Date.now()];
        expect(berlet.isValid()).to.be.false();
        done()
      });
    });
    describe('idore', function () {
      beforeEach(function (done) {
        berlet.startDate = Date.now();
        berlet.endDate = Date.now() + 3600;
        done();
      });

      it('fails if dates are wrong', function(done){
        berlet.startDate = Date.now() + 1000;
        berlet.save(function(err){
          expect(err).to.exist;
          done();
        });
      });

      it('is valid if date is OK', function (done) {
        expect(berlet.isValid()).to.be.true();
        done();
      });

      it('is not valid if out of date range', function (done) {
        berlet.alkalmak = 0;
        berlet.startDate = Date.now() - 1500;
        berlet.endDate = Date.now() - 2000;
        expect(berlet.isValid()).to.be.false();
        done();
      });
      it('is not valid if out of date range - 2', function (done) {
        berlet.alkalmak = 0;
        berlet.startDate = Date.now() + 3500;
        berlet.endDate = Date.now() + 5000;
        expect(berlet.isValid()).to.be.false();
        done();
      });
    });
  });

  afterEach(function (done) {
    Jogas.remove({});
    User.remove({});
    done();
  });
  after(function (done) {
    Jogas.remove().exec();
    User.remove().exec();
    done();
  });
});
