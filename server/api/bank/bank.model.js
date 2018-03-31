'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BankSchema = new Schema({
	bank: {type: String, required: true},
	ifsc: {type: String, required: true, unique: true},
	branch: {type: String, required: true},
	address: {type: String, required: true},
	contact: {type: String, required: true},
	state: {type: String, required: true},
	district: {type: String, required: true},
	city: {type: String, required: true},
	mirCode: {type: String, required: true}
});

module.exports = mongoose.model('Bank', BankSchema);