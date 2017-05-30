'use strict';

var _ = require('lodash');
var moment = require('moment');
var Userclass = require('./userclass.model');
var Notification = require('../notification/notification.model');

// Get list of userclasss
exports.index = function(req, res) {
  Userclass.find(function (err, userclasss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(userclasss);
  });
};

// Get a single userclass
exports.show = function(req, res) {
  Userclass.findById(req.params.id, function (err, userclass) {
    if(err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    return res.json(userclass);
  });
};

// Creates a new userclass in the DB.
exports.create = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(!req.body.classData.length){return handleError(res, 'Invalid class data');}
  var _classData = [];
  for(var i = 0; i < req.body.classData.length; i++){
    var _data = {
      studentID: req.user._id,
      teacherID: req.body.teacherID,
      requestedTime: {
        start: (moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').valueOf()),
        end: (moment(req.body.classData[i].end, 'YYYY-MM-DD HH:mm').valueOf()),
        dateFormated: moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').format('MMM DD, YYYY'),
        startFormated: moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').format('HH:mm'),
        endFormated: moment(req.body.classData[i].end, 'YYYY-MM-DD HH:mm').format('HH:mm')
      }
    }
    _classData.push(_data);
  }
  Userclass.create(_classData, function(err, userclass) {
    if(err) { return handleError(res, err); }
    for(var i = 0; i < userclass.length; i++){
      var _notificationData = {
        forUser: req.user._id,
        fromUser: req.body.teacherID,
        notificationType: 'classRequest',
        notificationStatus: 'unread',
        notificationMessage: 'Test Message',
        referenceClass: userclass[i]._id
      }
      Notification.create(_notificationData, function(err, notification){
        console.log(err);
        return res.status(201).json(userclass);
      });
    }
    
  });
};

// Updates an existing userclass in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Userclass.findById(req.params.id, function (err, userclass) {
    if (err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    var updated = _.merge(userclass, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(userclass);
    });
  });
};

// Deletes a userclass from the DB.
exports.destroy = function(req, res) {
  Userclass.findById(req.params.id, function (err, userclass) {
    if(err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    userclass.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
