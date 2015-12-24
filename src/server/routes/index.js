var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  var renderObject = {
    title: 'Passport Testing',
    user: req.user,
    successMessages: req.flash('success'),
    dangerMessages: req.flash('danger')
  };
  res.render('index', renderObject);
});

router.get('/ping', ensureAuthenticated, function(req, res){
  res.status(200).send("pong!");
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
