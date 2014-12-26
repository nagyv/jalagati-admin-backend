/**
 * Module dependencies.
 */
var Lab = require('lab'),
    server = require('../lib/'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var beforeEach = Lab.beforeEach;
var after = Lab.after;

//Globals
var user, user2;

//The tests
describe('Model User:', function () {
  before(function (done) {
    user = new User({
      name: 'Full name',
      email: 'test@test.com',
      username: 'user',
      password: 'password'
    });
    user2 = new User({
      name: 'Full name',
      email: 'test@test.com',
      username: 'user',
      password: 'password'
    });

    done();
  });

  describe('Method Save', function () {
    it('should begin with no users', function (done) {
      User.find({}, function (err, users) {
        expect(users).to.have.have.length(0);
        done();
      });
    });

    it('should fail with empty password', function(done) {
      var user3 = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user'
      });
      user3.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should be able to save whithout problems', function (done) {
      user.save(done);
    });

    it('should fail to save an existing user again', function (done) {
      user.save();
      return user2.save(function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      user.name = '';
      return user.save(function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('User', function(){
    it('can authenticate with correct password', function(done){
      expect(user.authenticate('password')).to.be.true();
      done();
    });
    it('authenticatation fails with wrong password', function(done){
      expect(user.authenticate('wrong password')).to.be.false();
      done();
    });
  });

  after(function (done) {
    User.remove().exec();
    done();
  });
});
