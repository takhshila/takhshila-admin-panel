'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionhistorySchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  transactionType: {type: String, enum : ["Credit", "Debit"], required: true},
  transactionDescription: {type: String},
  transactionAmount: {type: Number, required: true},
  transactionAmountType: {type: String, required: true},
  refrenceTransaction: {type: String, ref: 'Transaction'},
  previousBalance: {type: Number, required: true},
  newBalance: {type: Number, required: true},
  dateTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Transactionhistory', TransactionhistorySchema);