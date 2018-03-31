'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserclassSchema = new Schema({
  studentID: {type: String, ref: 'User', required: true},
  teacherID: {type: String, ref: 'User', required: true},
  requestedTopic: {type: String, ref: 'Topic', required: true},
  paymentRefrence: {type: String, ref: 'Transaction', default: null},
  requestedTime: {
    start: {type: String, required: true},
    end: {type: String, required: true},
    dateFormated: {type: String, required: true},
    startFormated: {type: String, required: true},
    endFormated: {type: String, required: true}
  },
  classRuntime: {type: Number, default: null},
  liveClassLink: {type: String, default: null},
  amount: {
    currency: {type: String, required: true},
    withdrawBalance: {type: Number, required: true},
    promoBalance: {type: Number, required: true},
    totalCost: {type: Number, required: true},
    paidToTeacher: {type: Number, required: true}
  },
  requestedOn: {type: Date, default: Date.now},
  additionalInfo: {type: String, default: null},
  status: {type: String, default: 'pendingPayment'}
});

module.exports = mongoose.model('Userclass', UserclassSchema);
