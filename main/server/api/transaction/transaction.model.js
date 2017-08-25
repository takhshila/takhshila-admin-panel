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
	    totalCost: {type: Number, required: true},
	    paidToTeacher: {type: Number, required: true}
	  },
	  requestedOn: {type: Date, default: Date.now},
  }],
  classID: {type: String, ref: 'Userclass'},
  userID: {type: String, ref: 'User', required: true},
  firstName: {type: String, required: true},
  lastName: {type: String},
  email: {type: String},
  phone: {type: Number, required: true},
  transactionData: {type: Object},
  status: {type: String, default: 'initiated'}
});

module.exports = mongoose.model('Transaction', TransactionSchema);