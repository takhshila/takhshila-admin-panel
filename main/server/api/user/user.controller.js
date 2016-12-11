'use strict';

var _ = require('lodash');
var moment = require('moment');
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
    if(user.isTeacher){
      res.json(user.teacherProfile);
    }else {
      res.json(user.profile);
    }
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
  if(typeof ratePerHour !== 'object'){ return res.status(400).send('Invalid Rate per Hour');}
  if(isNaN(ratePerHour.value)){ return res.status(400).send('Invalid Rate');}

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
    var _availability = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednessday: [],
      thursday: [],
      friday: [],
      saturday: []
    };
    var _weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];
    for(var i = 0; i < availability.length; i++){
      // var _day = moment(availability[i].start).get('day');
      var _start = moment(availability[i].start, 'YYYY-mm-DD HH:mm');
      var _end = moment(availability[i].end, 'YYYY-mm-DD HH:mm');
      var _day = (_start.day() - 1);
      if(_day == -1){
        _day = 6;
      }

      _availability[_weekDays[_day]].push({
        start: _start.format('HH:mm'),
        end: _end.format('HH:mm')
      });
    }
    console.log(_availability);
    user.availability = _availability;
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};
/**
 * Get user availability based on specified date and time
 */
exports.getAvailability = function(req, res, next) {
  var userId = req.params.id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(400).send('Invalid User');
    var _events = [];
    var _weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];
    for(var day = 0; day < _weekDays.length; day++){
      for(var i = 0; i < user.availability[_weekDays[day]].length; i++){
        var startDate = moment(req.body.start);
        var endDate = moment(req.body.end);
        var _startDate = moment(startDate, 'YYYY-mm-DD').add(day, 'days').format("MMM DD, YYYY");
        var _startTime = user.availability[_weekDays[day]][i].start.toString();
        var _endTime = user.availability[_weekDays[day]][i].end.toString();
        var _startDateTime = moment(_startDate + _startTime, 'MMM DD, YYYY HH:mm');
        var _endDateTime = moment(_startDate + _endTime, 'MMM DD, YYYY HH:mm');

        var _difference = (_endDateTime.unix() - _startDateTime.unix()) / 60;
        if(_difference > 30){
          do{
            _events.push({
              start: _startDateTime.format('MMM DD, YYYY HH:mm'),
              end: _startDateTime.add(30, 'minutes').format('MMM DD, YYYY HH:mm'),
              status: 'available'
            });
            _difference -= 30;
          }while(_difference >= 30)
        }else {
          _events.push({
            start: _startDateTime.format('MMM DD, YYYY HH:mm'),
            end: _startDateTime.add(30, 'minutes').format('MMM DD, YYYY HH:mm')
          });
        }
      }
    }
    res.json(_events);
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
