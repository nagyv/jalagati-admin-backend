var Lab = require('lab'),
  server = require('../lib/'),
  mongoose = require('mongoose'),
  sinon = require('sinon'),
  async = require('async'),
  User = mongoose.model('User'),
  Alkalom = mongoose.model('Alkalom'),
  Resztvevo = mongoose.model('Resztvevo'),
  Jogas = mongoose.model('Jogas');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var after = Lab.after;

describe('Model Alkalom:', function () {
  var jogas, alkalom;
  beforeEach(function (done) {
    jogas = new Jogas({
      name: 'Kiss Attila',
      nick: 'kicsi'
    });
    alkalom = new Alkalom({
      date: Date.now(),
      location: 'itt',
      tartja: 'Sisi',
      segiti: 'Bika'
    });
    jogas.save(function (/*err*/) {
      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      return alkalom.save(function (err) {
        expect(err).to.not.exist();
        done();
      });
    });
  });
  describe('Method addResztvevo', function () {
    it('should be able to handle more people', function (done) {
      alkalom.save(function (/*err*/) {
        alkalom.addResztvevo(jogas, function (err) {
          expect(err).to.not.exist();
          expect(alkalom.resztvevok).to.have.length(1);
          expect(alkalom.resztvevok[0].name).to.equal(jogas.name);
          Resztvevo.findById(alkalom.resztvevok[0].resztvevo)
            .exec(function(err, resztvevo){
              expect(err).to.not.exist();
              expect(resztvevo.jogas.toString()).to.equal(jogas.id.toString());
              expect(resztvevo.alkalom.toString()).to.equal(alkalom.id.toString());
              done();
          });
        });
      });
    });
  });

  describe('method removeResztvevo', function() {
    beforeEach(function(done){
      Resztvevo.remove({}, done);
    });
    beforeEach(function(done){
      alkalom.addResztvevo(jogas, done);
    });
    it('should remove a resztvevo', function(done){
      expect(alkalom.resztvevok).to.have.length(1);
      alkalom.removeResztvevo(alkalom.resztvevok[0].resztvevo, function(err){
        expect(err).to.not.exist();
        expect(alkalom.resztvevok).to.have.length(0);
        expect(Resztvevo.count({}, function(err, count){
          expect(count).to.equal(0);
          done();
        }));
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

describe('Model Resztvevo', function(){
  var jogas, alkalom;

  beforeEach(function(done){
    jogas = new Jogas({
      name: 'Kiss Attila',
      nick: 'kicsi'
    });
    alkalom = new Alkalom({
      date: Date.now(),
      location: 'itt',
      tartja: 'Sisi',
      segiti: 'Bika'
    });
    async.series([
      function(cb){
       jogas.save(cb);
      },
      function(cb){
        alkalom.save(cb);
      }
    ], done);
  });
  afterEach(function(done){
    Alkalom.remove().exec();
    Jogas.remove().exec();
    User.remove().exec();
    done();
  });

  it('has sane defaults', function(done){
    var resztvevo = new Resztvevo({
      jogas: jogas,
      alkalom: alkalom
    });
    expect(resztvevo.berlet).to.be.undefined;
    expect(resztvevo.torulkozo).to.be.false;
    expect(resztvevo.szamla).to.be.false;
    done();
  });

  it('uses berlet if exists', function(done){
    jogas.berletek.push({
      alkalmak: 10
    });
    jogas.save(function(err, jogas){
      expect(err).to.not.exist;
      var resztvevo = new Resztvevo({
        jogas: jogas,
        alkalom: alkalom
      });
      resztvevo.save(function(err, resztvevo){
        expect(err).to.not.exist;
        expect(resztvevo.berlet).to.be.truthy;
        done();
      });
    });
  });

  it('can restore berlet', function(done){
    jogas.berletek.push({
      alkalmak: 10
    });
    jogas.save(function(err, jogas){
      var resztvevo = new Resztvevo({
        jogas: jogas,
        alkalom: alkalom
      });
      resztvevo.save(function(err, resztvevo){
        expect(err).to.not.exist;
        resztvevo.restoreBerlet(function(err){
          console.log(err);
          expect(err).to.not.exist;
          expect(jogas.berlet.felhasznalva).has.length(0);
          done();
        });
      });
    });
  });

  it('restores berlet when removed', function(done){
    jogas.berletek.push({
      alkalmak: 10
    });
    jogas.save(function(err, jogas){
      var resztvevo = new Resztvevo({
        jogas: jogas,
        alkalom: alkalom
      });
      resztvevo.save(function(err, resztvevo){
        expect(err).to.not.exist;
        resztvevo.remove(function(err){
          console.log(err);
          expect(err).to.not.exist;
          expect(jogas.berlet.felhasznalva).has.length(0);
          done();
        });
      });
    });
  });
});
