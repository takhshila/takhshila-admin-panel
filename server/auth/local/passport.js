var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'phone', 
      passReqToCallback: true
    },
    function(req, phone, password, done) {
      User.findOne({
        dialCode: req.body.dialCode,
        phone: req.body.phone,
        isPhoneVerified: true,
        status: 'active'
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This phone number is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));
};