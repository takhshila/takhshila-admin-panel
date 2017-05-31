'use strict';

var _ = require('lodash');
var moment = require('moment');
var User = require('./user.model');
var Userclass = require('../userclass/userclass.model');
var Topic = require('../topic/topic.model');
var School = require('../school/school.model');
var Degree = require('../degree/degree.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var moment = require('moment');

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
  User.findById(userId)
  .populate('specialization.topic')
  .exec( function (err, user) {
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
  if(isNaN(ratePerHour.value) || (ratePerHour.value <= 0)){ return res.status(400).send('Invalid Rate');}

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
      var _start = moment(availability[i].start, 'YYYY-MM-DD HH:mm');
      var _end = moment(availability[i].end, 'YYYY-MM-DD HH:mm');
      var _day = (_start.day() - 1);
      if(_day == -1){
        _day = 6;
      }

      _availability[_weekDays[_day]].push({
        start: _start.format('HH:mm'),
        end: _end.format('HH:mm')
      });
    }
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
    var _bookedClass = [];
    var _weekDays = ['sunday', 'monday', 'tuesday', 'wednessday', 'thursday', 'friday', 'saturday'];

    var _dayOfWeek = _weekDays.indexOf(moment().format('dddd').toLowerCase());
    var _currentTime = moment().valueOf();
    var _weekStartDate = moment(req.body.start);
    
    Userclass.find({
      'teacherID': userId,
      'requestedTime.start': {$gte: _currentTime},
      'status': {$in: ['requested', 'confirmed']}
    }, function(err, userclass){
      var _bookedClasses = {};
      for(var a = 0; a < userclass.length; a++){
        var _bookedClassStart = parseInt(userclass[a].requestedTime.start);
        var _bookedClassEnd = parseInt(userclass[a].requestedTime.end);
        var _bookedTimeDifference = (_bookedClassEnd - _bookedClassStart) / (60*1000);
        if(_bookedTimeDifference > 30){
          do{
            _bookedClasses[_bookedClassStart] = {
              start: _bookedClassStart,
              end: _bookedClassStart + (30 * 60 * 1000),
              dateTime: moment(_bookedClassStart).format("MMM DD, YYYY HH:mm a"),
              status: userclass[a].status
            }
            _bookedClassStart += (30 * 60 * 1000);
            _bookedTimeDifference -= 30;
          }while (_bookedTimeDifference >= 30)
        }else{
          _bookedClasses[_bookedClassStart] = {
            start: _bookedClassStart,
            end: _bookedClassEnd,
            dateTime: moment(_bookedClassStart).format("MMM DD, YYYY HH:mm a"),
            status: userclass[a].status
          };
        }
      }

      for(var day = 0; day < _weekDays.length; day++){
        // if(day < _dayOfWeek){
        //   continue;
        // }
        for(var i = 0; i < user.availability[_weekDays[day]].length; i++){

          var _startTime = moment(user.availability[_weekDays[day]][i].start, 'HH:mm').format('HH:mm');
          var _endTime = moment(user.availability[_weekDays[day]][i].end, 'HH:mm').format('HH:mm');

          var _startDate = moment(_weekStartDate, 'YYYY-MM-DD').add(day, 'days').format('MMM DD, YYYY');
          if(_endTime == "00:00"){
            var _endDate = moment(_weekStartDate, 'YYYY-MM-DD').add(day+1, 'days').format('MMM DD, YYYY');
          }else{
            var _endDate = moment(_weekStartDate, 'YYYY-MM-DD').add(day, 'days').format('MMM DD, YYYY');
          }

          var _startDateTime = moment(_startDate + _startTime, 'MMM DD, YYYY HH:mm');
          var _endDateTime = moment(_endDate + _endTime, 'MMM DD, YYYY HH:mm');
          if( req.params.id && _endDateTime.valueOf() < _currentTime){ continue; }
          var _difference = (_endDateTime.valueOf() - _startDateTime.valueOf()) / (60 * 1000);
          if(_difference > 30){
            do{
              if(_startDateTime.valueOf() >= _currentTime){
                var _status = 'available';
                if(_bookedClasses[_startDateTime.valueOf()] !== undefined){
                  _status = _bookedClasses[_startDateTime.valueOf()].status;
                }
                _events.push({
                  start: _startDateTime.format('MMM DD, YYYY HH:mm'),
                  end: _startDateTime.add(30, 'minutes').format('MMM DD, YYYY HH:mm'),
                  status: _status
                });
              }else {
                _startDateTime.add(30, 'minutes').format('MMM DD, YYYY HH:mm');
              }
              _difference -= 30;
            }while(_difference >= 30)
          }else {
            if(_startDateTime.valueOf() >= _currentTime){
              var _status = 'available';
              if(_bookedClasses[_startDateTime.valueOf()] !== undefined){
                _status = _bookedClasses[_startDateTime.valueOf()].status;
              }
              _events.push({
                start: _startDateTime.format('MMM DD, YYYY HH:mm'),
                end: _startDateTime.add(30, 'minutes').format('MMM DD, YYYY HH:mm'),
                status: _status
              });
            }
          }
        }
      }

      res.json(_events);

    });
  });
};
/**
 * Get current user availability based on specified date and time
 */
exports.getCurrentUserAvailability = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(400).send('Invalid User');
    res.json(user.availability);
  });
};
/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword')
  .populate('specialization.topic')
  .exec(function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Add Specializtion
 */
exports.addSpecialization = function (req, res, next) {
  var userId = req.user._id;

  var specializationList = req.body;
  User.findById(userId)
  .exec(function (err, user){
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    var promiseOne = specializationList.map(function(specialization, index){
      return new Promise(function(resolve, reject){
        if(!specialization.topic){
          Topic.findOne({
            topicName: specialization.topicName.toLowerCase().trim()
          }, function(err, topic){
            if(err) { return reject(err); }
            if(topic && (topic.active === true || (topic.active === false && topic.addedByID.toString() === userId.toString()))){
              specializationList[index].topic = topic._id;
              resolve(specialization);
            }else{
              var newTopic = {
                topicName: specialization.topicName,
                addedByID: userId,
                active: false,
              }
              Topic.create(newTopic, function(err, topic){
                if(err) { return reject(err); }
                specializationList[index].topic = topic._id;
                resolve(specialization);
              });
            }
          });
        }else{
          resolve(specialization);
        }
      });
    });

    Promise.all(promiseOne)
    .then(function(data){
      var promiseTwo = specializationList.map(function(specialization, index){
        return new Promise(function(resolve, reject){
          if(_.find(user.specialization, function(obj) { return obj.topic.toString() === specialization.topic.toString(); }) === undefined){
            user.specialization.push(specializationList[index]);
          }
          resolve(specialization);
        })
      });
      Promise.all(promiseTwo)
      .then(function(data){
        user.save(function(err){
          if(err) { return handleError(res, err); }
          User.findById(userId)
          .populate('specialization.topic')
          .exec(function(err, user){
            if(err) { return handleError(res, err); }
            return res.status(200).json(user.specialization);
          })
        });
      })
      .catch(function(err){
        return handleError(res, err);
      })
    })
    .catch(function(err){
      return handleError(res, err);
    });


    // Topic.findById(specialization.topic, function(err, topic){
    //   if (err) { return handleError(res, err); }
    //   var topicExists = _.find(user.specialization, {'topic': specialization.topic});
    //   if(topicExists === undefined){
    //     if(topic){
    //       user.specialization.push(specialization);
    //       user.save(function(err){
    //         if(err) { return handleError(res, err); }
    //         return res.status(200).json(user);
    //       });
    //     }else{
    //       var newTopic = {
    //         topicName: specialization.topicName,
    //         addedByID: userId,
    //         active: false,
    //       }
    //       Topic.create(newTopic, function(err, topic) {
    //         if(err) { return handleError(res, err); }
    //         specialization.topic = topic._id;
    //         user.specialization.push(specialization);
    //         user.save(function(err, data){
    //           if(err) { return handleError(res, err); }
    //           return res.status(200).json(user);
    //         });
    //       });
    //     }
    //   }else{
    //     return res.status(409).send('Specializtion already exists');
    //   }
    // });
  })
};
/**
 * Delete Specializtion
 */
exports.deleteSpecialization = function (req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    if(!user.specialization.id(req.params.id)){ return res.status(404).send('Not Found'); }
    user.specialization.id(req.params.id).remove();
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
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
    var checkSchoolPromise = new Promise(function(resolve, reject){
      if(!education.schoolId){
        School.findOne({
          schoolName: education.schoolName
        })
        .exec(function(err, school){
          if(err) { return reject(err); }
          if(school && (school.active === true || (school.active === false && school.addedByID.toString() === userId.toString()))){
            education.schoolId = school._id;
            resolve(school);
          }else{
            School.create({
              schoolName: education.schoolName,
              addedByID: userId,
              active: false
            }, function(err, school){
              if(err) { return reject(err); }
              education.schoolId = school._id;
              resolve(school);
            })
          }
        })
      }else{
        School.findById(education.schoolId, function(err, school){
          if(err) { return reject(err); }
          if(!school) { return reject("Invalid school"); }
          resolve(school)
        })
      }
    });

    var checkDegreePromise = new Promise(function(resolve, reject){
      if(!education.degreeId){
        Degree.findOne({
          degreeName: education.degreeName
        })
        .exec(function(err, degree){
          if(err) { return reject(err); }
          if(degree && (degree.active === true || (degree.active === false && degree.addedByID.toString() === userId.toString()))){
            education.degreeId = degree._id;
            resolve(degree);
          }else{
            Degree.create({
              degreeName: education.degreeName,
              addedByID: userId,
              active: false
            }, function(err, degree){
              if(err) { return reject(err); }
              education.degreeId = degree._id;
              resolve(degree);
            })
          }
        })
      }else{
        Degree.findById(education.degreeId, function(err, degree){
          if(err) { return reject(err); }
          if(!degree) { return reject("Invalid degree"); }
          resolve(degree)
        })
      }
    });

    Promise.all([checkSchoolPromise, checkDegreePromise])
    .then(function(data){
      user.education.push(education);
      user.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(user.education);
      });
    })
    .catch(function(err){
      return handleError(res, err);
    })
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
