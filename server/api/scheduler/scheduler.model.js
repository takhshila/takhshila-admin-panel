'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchedulerSchema = new Schema({
  jobName: {type: String, required : true},
  jobTime: {type: String, required: true},
  jobData: {type: String, default: null},
  emitEvent: {type: Boolean, default: false},
  eventName: {type: String, default: null},
  callback: {type: Boolean, default: false},
  callbackFunction: {type: String, default: null},
  addedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Scheduler', SchedulerSchema);