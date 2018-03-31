'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionhistorySchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  transactionRefrence: {type: String, ref: 'Transaction', default: null},
  classRefrence: {type: String, ref: 'Userclass', default: null},
  transactionIdentifier: {type: String},
  transactionType: {type: String, enum : ["Credit", "Debit"], required: true},
  transactionDescription: {type: String},
  transactionAmount: {type: Number, required: true},
  transactionAmountType: {type: String, required: true},
  previousBalance: {type: Number, required: true},
  newBalance: {type: Number, required: true},
  status: {type: String, default: 'pending'},
  dateTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Transactionhistory', TransactionhistorySchema);