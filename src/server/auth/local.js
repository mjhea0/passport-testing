var passport = require('passport');
var LocalStrategy = require('passport-local');

var User = require('../models/users');

passport.use(new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      user.comparePassword(password, function(err, isMatch) {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if (!err) {
      done(null, user);
    } else {
      done(err, null);
    }
  });
});

module.exports = passport;
