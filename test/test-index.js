process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose-q')(require('mongoose'));
var passportStub = require('passport-stub');

var server = require('../src/server/app');
var User = require('../src/server/models/users');

var should = chai.should();

passportStub.install(server);
chai.use(chaiHttp);


// *** Unauthenticated *** //

describe('When unauthenticated', function() {

  it('index should render correctly', function(done) {
    chai.request(server)
    .get('/')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.html; // jshint ignore:line
      res.text.should.have.string('<h1>Welcome, <em>stranger</em>!</h1>');
      res.text.should.have.string('<h3><a href="/ping">Ping</a></h3>');
      res.text.should.have.string(
        '<a class="navbar-brand" id="brand" href="/">Passport-Testing</a>'
      );
      res.text.should.have.string('<li><a href="/auth/login">Login</a></li>');
      res.text.should.have.string(
        '<li><a href="/auth/register">Register</a></li>'
      );
      res.text.should.not.have.string(
        '<li><a href="/auth/logout">Logout</a></li>'
      );
      done();
    });
  });

  it('ping should render correctly', function(done) {
    chai.request(server)
    .get('/ping')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.html;  // jshint ignore:line
      res.text.should.have.string('<h1>Welcome, <em>stranger</em>!</h1>');
      res.text.should.have.string('<h3><a href="/ping">Ping</a></h3>');
      res.text.should.have.string(
        '<a class="navbar-brand" id="brand" href="/">Passport-Testing</a>'
      );
      res.text.should.not.have.string('You must be logged in to do that.');
      res.text.should.not.have.string(
        '<li><a href="/auth/logout">Logout</a></li>'
      );
      done();
    });
  });

});


// *** Authenticated *** //

describe('When authenticated', function() {

  beforeEach(function(done) {

    mongoose.connection.db.dropDatabase();

    var testUser = new User({
      username: 'michael@mherman.org',
      password: 'michael'
    });

    testUser.saveQ()
    .then(function(user) {
      passportStub.login(user);
      done();
    });

  });

  afterEach(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });

  it('should render correctly', function(done) {
    chai.request(server)
    .get('/')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.html; // jshint ignore:line
      res.text.should.have.string(
        '<h1>Welcome, <em>michael@mherman.org</em>!</h1>'
      );
      res.text.should.not.have.string('<h1>Welcome, <em>stranger</em>!</h1>');
      res.text.should.have.string('<h3><a href="/ping">Ping</a></h3>');
      res.text.should.have.string(
        '<a class="navbar-brand" id="brand" href="/">Passport-Testing</a>'
      );
      res.text.should.not.have.string('<li><a href="/auth/login">Login</a></li>');
      res.text.should.not.have.string(
        '<li><a href="/auth/register">Register</a></li>'
      );
      res.text.should.have.string(
        '<li><a href="/auth/logout">Logout</a></li>'
      );
      done();
    });
  });

  it('Ping should render correctly', function(done) {
    chai.request(server)
    .get('/ping')
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.html;  // jshint ignore:line
      res.text.should.have.string('pong!');
      done();
    });
  });

});