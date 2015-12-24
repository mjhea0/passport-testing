var express = require('express');
var router = express.Router();
var mongoose = require('mongoose-q')(require('mongoose'));

var User = require('../models/users');
var passportLocal = require('../auth/local');


router.get('/logout', ensureAuthenticated, function(req, res, next) {
  req.logout();
  req.flash('success', 'You successfully logged out.');
  res.redirect('/');
});


// *** Local Authentication *** //

router.get('/login', function(req, res, next) {
  res.render('login', {
    user: req.user,
    dangerMessages: req.flash('danger')
  });
});

router.post('/login', function(req, res, next) {
  passportLocal.authenticate('local', function(err, user, info) {
    if (err) {
      req.flash('danger', 'Invalid username and/or password.');
      return next(err);
    }
    if (!user) {
      req.flash('danger', 'Invalid username and/or password.');
      return res.redirect('/auth/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        req.flash('danger', 'Invalid username and/or password.');
        return next(err);
      }
      req.flash('success', 'Welcome!');
      res.redirect('/');
    });
  })(req, res, next);
});

router.get('/register', function(req, res, next) {
  res.render('register', {
    user: req.user,
    dangerMessages: req.flash('danger')
  });
});

router.post('/register', function(req, res, next) {
  var newUser = new User(req.body);
  newUser.generateHash(req.body.password, function(err, hash) {
    if (err) {
      req.flash('danger', 'Something went wrong.');
      return next(err);
    } else {
      newUser.password = hash;
      newUser.saveQ()
      .then(function(result) {
        passportLocal.authenticate('local', function(err, user, info) {
          if (err) {
            req.flash('danger', 'Something went wrong.');
            return next(err);
          }
          req.logIn(user, function(error) {
            if (error) {
              req.flash('danger', 'Something went wrong.');
              return next(error);
            }
            req.flash('success', 'Welcome!');
            res.redirect('/');
          });
        })(req, res, next);
      })
      .catch(function(err) {
        req.flash('danger', 'Something went wrong.');
        res.send(err);
      })
      .done();
    }
  });
});


// *** Helper Functions *** //

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'You must be logged in to do that.');
    res.redirect('/');
  }
}

module.exports = router;
