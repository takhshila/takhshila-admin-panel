'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  transactionType: {type: String, enum : ["Credit", "Debit"], required: true},
  transactionIdentifier: {type: String},
  transactionDescription: {type: String},
  transactionAmount: {type: Number, required: true},
  transactionData: {type: Object, default: null},
  classRefrence: {type: String, ref: 'Userclass', default: null},
  dateTime: {type: Date, default: Date.now},
  status: {type: String, default: 'pending'},
});

module.exports = mongoose.model('Transaction', TransactionSchema);