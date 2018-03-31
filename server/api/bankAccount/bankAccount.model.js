'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BankAccountSchema = new Schema({
    userID: {type: String, ref: 'User', required: true},
    bankID: {type: String, ref: 'Bank', required: true},
  	name: {type: String, required: true},
  	accountNumber: {type: String, required: true},
  	bankName: {type: String, required: true},
  	branchName: {type: String, required: true},
  	ifscCode: {type: String, required: true},
  	isDefault: {type: Boolean, default: false},
  	dateTime: {type: Date, default: Date.now},
	active: {type: Boolean, default: true}
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);