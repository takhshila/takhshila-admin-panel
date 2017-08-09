'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  amount: {type: Number, required: true},
  currency: {type: String, required: true},
  productInfo: {type: String, required: true},
  classInfo: [{
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
	  	cost: {type: Number, required: true}
	  },
	  requestedOn: {type: Date, default: Date.now},
  }],
  classID: {type: String, ref: 'Userclass'},
  firstName: {type: String, required: true},
  lastName: {type: String},
  email: {type: String},
  phone: {type: Number, required: true},
  status: {type: String, default: 'Not Started'}
});

module.exports = mongoose.model('Transaction', TransactionSchema);