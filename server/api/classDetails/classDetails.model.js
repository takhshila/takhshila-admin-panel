'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClassDetailsSchema = new Schema({
  classId: {type: String, ref: 'Userclass', required: true},
  userId: {type: String, ref: 'User', required: true},
  userType: {type: String, required: true},
  mesaage: {type: String, required: true},
  additionalInfo: {type: String, required: true},
  updatedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('ClassDetails', ClassDetailsSchema);