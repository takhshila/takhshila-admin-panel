'use strict';

var _ = require('lodash');
var Notification = require('./notification.model');

// Get list of notifications
exports.index = function(req, res) {
  var userID = req.user._id;
  Notification
  .find({ forUser: userID })
  .populate('fromUser', '-hashedPassword -salt')
  .populate('referenceClass')
  .sort({'createdOn': 'desc'})
  .exec(function (err, notifications) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(notifications);
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
  var notificationList = req.body.notificationList;
  if(notificationList.length > 0){
    var promiseList = notificationList.map(function(notificationId){
      return new Promise(function(resolve, reject){
        Notification
        .findById(notificationId, function(err, notification){
          if (!err) {
            notification.notificationStatus = "read";
            notification.save(function(err){
              resolve("Notification Updated");
            })
          }else{
            resolve("Notification not found. Proceed with next notification");
          }
        })
      });
    })
  }else{
    return res.status(400).send('Invalid List');
  }

  Promise.all(promiseList)
  .then(function(data){
    return res.status(204).send('No Content');
  })
  .catch(function(err){
    if(err) { return handleError(res, err); }
  })
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
