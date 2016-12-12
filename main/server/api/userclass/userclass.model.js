'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserclassSchema = new Schema({
  studentID: {type: String, ref: 'User', required: true},
  teacherID: {type: String, ref: 'User', required: true},
  requestedTime: {
    date: {type: String, required: true},
    start: {type: String, required: true},
    end: {type: String, required: true}
  },
  requestedOn: {type: Date, default: Date.now},
  status: {type: String, default: 'requested'}
});

module.exports = mongoose.model('Userclass', UserclassSchema);
