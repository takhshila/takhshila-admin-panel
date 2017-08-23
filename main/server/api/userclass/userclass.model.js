'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserclassSchema = new Schema({
  studentID: {type: String, ref: 'User', required: true},
  teacherID: {type: String, ref: 'User', required: true},
  requestedTime: {
    start: {type: String, required: true},
    end: {type: String, required: true},
    dateFormated: {type: String, required: true},
    startFormated: {type: String, required: true},
    endFormated: {type: String, required: true}
  },
  amount: {
    currency: {type: String, required: true},
    totalCost: {type: Number, required: true},
    paidToTeacher: {type: Number, required: true}
  },
  requestedOn: {type: Date, default: Date.now},
  status: {type: String, default: 'pendingPayment'}
});

module.exports = mongoose.model('Userclass', UserclassSchema);
