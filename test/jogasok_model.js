/**
 * Module dependencies.
 */
var Lab = require('lab'),
  server = require('../lib/'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  utils = require('./utils'),
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

//The tests
describe('Model Jogas:', function () {
  var jogas;
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
    var berlet = {
      alkalmak: 10,
      fizetett: 500
    };
    jogas.berletek.push(berlet);
    jogas.berletek.push({
      alkalmak: 5,
      fizetett: 500
    });
    jogas.save(function(err, jogas){
      expect(err).to.not.exist;
      expect(jogas.berlet.alkalmak).to.be.equal(berlet.alkalmak);
      done();
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

describe('Model Berlet', function () {
  var jogas, berlet;
  beforeEach(function (done) {
    jogas = new Jogas({
      name: 'Kiss Attila',
      nick: 'kicsi'
    });
    jogas.save(done);
  });
  beforeEach(function (done) {
    berlet = new Berlet({
      alkalmak: 10,
      fizetett: 500
    });
    jogas.berletek.push(berlet);
    done();
  });
  afterEach(function (done) {
    utils.clearAllJogas(done);
  });

  it('can be attached to Jogas and accessed under berlet', function (done) {
    jogas.save(function (err) {
      expect(err).to.not.exist;
      expect(jogas.berlet.id).to.be.equal(berlet.id);
      done();
    });
  });
  it('can be used up if valid', function (done) {
    jogas.save(function (err) {
      expect(err).to.not.exist;
      jogas.berlet.hasznal({
        _id: jogas._id,
        alkalom: berlet._id
      }, function (err, jogas) {
        expect(err).to.not.exist;
        expect(jogas.berlet).to.exist;
        expect(jogas.berlet.felhasznalva).to.have.length(1);
        done();
      });
    });
  });
  it('can not be used if invalid', function (done) {
    var used = jogas.berletek[0];
    used.alkalmak = 1;
    used.felhasznalva = [{
      resztvevo: jogas._id,
      alkalom: berlet._id
    }];
    used.save(function (err) {
      expect(err).to.not.exist;
      used.hasznal({
          resztvevo: jogas._id,
          alkalom: berlet._id
        }, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });
  it('can restore usage', function(done){
    var used = jogas.berletek[0];
    used.alkalmak = 1;
    used.felhasznalva = [{
      resztvevo: jogas._id,
      alkalom: berlet._id
    }];
    used.save(function (err) {
      expect(err).to.not.exist;
      used.restore(berlet, function (err) {
        expect(err).to.not.exist;
        expect(used.felhasznalva).to.have.length(0);
        done();
      });
    });
  });
  describe('alkalomra', function () {
    it('has 3 month limit for alkalmak', function(done){
      berlet.save(function(err, berlet){
        expect(err).to.not.exist;
        expect(moment().isSame(berlet.startDate, 'day')).to.be.true();
        expect(moment().add(3, 'months').isSame(berlet.endDate, 'day')).to.be.true();
        done();
      });
    });
    it('is valid if has alkalom', function (done) {
      expect(berlet.isValid()).to.be.true();
      done();
    });
    it('is not valid if has no more alkalom', function (done) {
      berlet.alkalmak = 1;
      berlet.felhasznalva = [{
        date: Date.now(),
        alkalom: berlet._id
      }];
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
      berlet.startDate = moment(berlet.endDate).add(1, 'day').toDate();
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
  describe('listActive', function() {
    beforeEach(function(done){
      // adds a valid and an invalid berlet
      var yesterday = moment().subtract(1, 'days');
      jogas.berletek[0].startDate = yesterday.toDate();
      jogas.berletek[0].endDate = yesterday.clone().add(3, 'months').toDate();
      var berlet2 = new Berlet({
        startDate: yesterday.clone().subtract(4, 'month').toDate(),
        endDate: yesterday.clone().subtract(2, 'months').toDate(),
        fizetett: 100
      });
      jogas.berletek.push(berlet2);
      jogas.save(done);
    });

    it('returns all the active berlets', function(done){
      Berlet.listActive(function(err, berletek){
        expect(err).to.not.exist;
        expect(berletek).to.have.length(1);
        expect(berletek[0].name).to.equal(jogas.name);
        expect(moment(berletek[0].berlet.startDate).isSame(jogas.berletek[0].startDate)).to.be.true();
        done();
      });
    });
  });
});
