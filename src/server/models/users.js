var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR;

if (process.env.NODE_ENV === 'test') {
  SALT_WORK_FACTOR = 1;
} else {
  SALT_WORK_FACTOR = 10;
}

var User = new Schema({
  username: { type: String, required: true },
  password: String
});

User.methods.generateHash = function(password, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      return cb(err, hash);
    });
  });
};

User.methods.comparePassword = function(password, next) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) {
      return next(err);
    }
    return next(null, isMatch);
  });
};

module.exports = mongoose.model('users', User);

