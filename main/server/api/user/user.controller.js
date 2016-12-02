'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};
/**
 * Update my basic info
 */
exports.updateBasicInfo = function(req, res, next) {
  var userId = req.user._id;
  var basicInfo = req.body.basicInfo;
  if(basicInfo === undefined || basicInfo === null) { return res.status(400).send('Invalid Value'); }

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.basicInfo = String(basicInfo);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update my status
 */
exports.updateStatus = function(req, res, next) {
  var userId = req.user._id;
  var status = req.body.status;
  if(status === undefined || status === null) { return res.status(400).send('Invalid Value'); }

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.status = String(status);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update profile photo
 */
exports.updateProfilePhoto = function(req, res, next) {
  var userId = req.user._id;
  var profilePhoto = req.body.profilePhoto;
  if(profilePhoto === undefined || profilePhoto === null) { return res.status(400).send('Invalid Image'); }

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.profilePhoto.dataURI = profilePhoto;
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update Rate per Hour
 */
exports.updateRatePerHour = function(req, res, next) {
  var userId = req.user._id;
  var ratePerHour = req.body.ratePerHour;
  if(isNaN(ratePerHour)){ return res.status(400).send('Invalid Rate');}

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.isTeacher) { return res.status(404).send('You are not allowed to add rate per hour'); }
    user.ratePerHour = ratePerHour;
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update user availability
 */
exports.updateAvailability = function(req, res, next) {
  var userId = req.user._id;
  var availability = req.body.availability;
  if(typeof availability !== 'object'){return res.status(400).send('Invalid Availability');}

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.isTeacher) { return res.status(404).send('You are not allowed to update availability'); }
    user.availability = availability;
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Add Education
 */
exports.addEducation = function (req, res, next) {
  var userId = req.user._id;
  var education = req.body;
  if(education === undefined || education === null) { return res.status(400).send('Invalid Education Details'); }

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.education.push(education);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update user education
 */
exports.updateEducation = function(req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.education.id(req.params.id)){ return res.status(404).send('Not Found'); }
    _.merge(user.education.id(req.params.id), req.body);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Delete Education
 */
exports.deleteEducation = function (req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.education.id(req.params.id)){ return res.status(404).send('Not Found'); }
    user.education.id(req.params.id).remove();
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};

/**
 * Add Experience
 */
exports.addExperience = function (req, res, next) {
  var userId = req.user._id;
  var experience = req.body;
  if(experience === undefined || experience === null) { return res.status(400).send('Invalid Education Details'); }

  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.experience.push(experience);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Update user Experience
 */
exports.updateExperience = function(req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.experience.id(req.params.id)){ return res.status(404).send('Not Found'); }
    _.merge(user.experience.id(req.params.id), req.body);
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Delete Experience
 */
exports.deleteExperience = function (req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.experience.id(req.params.id)){ return res.status(404).send('Not Found'); }
    user.experience.id(req.params.id).remove();
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

function handleError(res, err) {
  return res.status(500).send(err);
}
