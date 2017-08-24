'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionhistorySchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  previousBalance: {type: Number, required: true, default: 0.00},
  newBalance: {type: Number, required: true, default: 0.00},
  transactionType: {type: String, enum : ["credit", "debit"], required: true},
  transactionDescription: {type: String, enum : ["credit", "debit"], required: true},
  transactionData: {type: String, default: null},
  refrenceClass: {type: String, ref: 'Userclass'},
  dateTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Transactionhistory', TransactionhistorySchema);