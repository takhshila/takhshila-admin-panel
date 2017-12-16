'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  forUser: {type: String, ref: 'User', required: true},
  fromUser: {type: String, ref: 'User', default: null},
  notificationType: {type: String, required: true},
  notificationStatus: {type: String, required: true},
  notificationMessage: {type: String, required: true},
  referenceClass: {type: String, ref: 'Userclass', default: null},
  createdOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Notification', NotificationSchema);
