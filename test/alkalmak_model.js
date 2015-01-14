var Lab = require('lab'),
  server = require('../lib/'),
  mongoose = require('mongoose'),
  sinon = require('sinon'),
  User = mongoose.model('User'),
  Alkalom = mongoose.model('Alkalom'),
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
          expect(alkalom.resztvevok[0]).to.equal(jogas._id);
          done();
        });
      });
    });
  });

  describe('method removeResztvevo', function() {
    it('should remove a resztvevo', function(done){
      sinon.spy(jogas, 'removeAlkalom');
      alkalom.removeResztvevo(jogas, function(err, alkalom){
        expect(err).to.not.exist();
        expect(alkalom.resztvevok).to.have.length(0);
        expect(jogas.removeAlkalom.calledOnce).to.be.true();
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
