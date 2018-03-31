'use strict';

var _ = require('lodash');
var Notification = require('./notification.model');
var Topic = require('../topic/topic.model');

// Get list of notifications
exports.index = function(req, res) {
  var userID = req.user._id;
  Notification
  .find({ forUser: userID })
  .populate('fromUser', '-hashedPassword -salt')
  .populate({
    path: 'referenceClass'
  })
  .sort({'createdOn': 'desc'})
  .exec(function (err, notifications) {
    if(err) { return handleError(res, err); }
    Topic.populate(notifications, {
      path: 'referenceClass.requestedTopic'
    }, function(err, response){
      return res.status(200).json(response);
    })
  });
};

// Get a single notification
exports.show = function(req, res) {
  Notification.findById(req.params.id, function (err, notification) {
    if(err) { return handleError(res, err); }
    if(!notification) { return res.status(404).send('Not Found'); }
    return res.json(notification);
  });
};

// Creates a new notification in the DB.
exports.create = function(req, res) {
  var userID = req.user._id;
  Notification.create(req.body, function(err, notification) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(notification);
  });
};

// Updates an existing notification in the DB.
exports.update = function(req, res) {
  // var notificationList = req.body.notificationList;
  var userID = req.user._id;
  Notification
  .find({ forUser: userID, notificationStatus: 'unread' })
  .exec(function (err, notifications) {
    if(err) { return handleError(res, err); }
    notifications.forEach(function(notification){
      Notification.findById(notification._id, function(err, newNotification){
        newNotification.notificationStatus = "read";
        newNotification.save();
      })
    });
    return res.status(204).send('No Content');
  });
};

// Deletes a notification from the DB.
exports.destroy = function(req, res) {
  Notification.findById(req.params.id, function (err, notification) {
    if(err) { return handleError(res, err); }
    if(!notification) { return res.status(404).send('Not Found'); }
    notification.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
