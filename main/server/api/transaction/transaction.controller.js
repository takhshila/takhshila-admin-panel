'use strict';

var _ = require('lodash'),
    crypto = require('crypto'),
    moment = require('moment'),
    Transaction = require('./transaction.model'),
    User = require('../user/user.model'),
    hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10",
    merchantID = 5804204,
    key = 'gtKFFx',
    salt = 'eCwWELxi';


// Initiate transactions
exports.initiateTransaction = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(!req.body.classData.length){return handleError(res, 'Invalid class data');}
  
  var classData = [], totalAmount = 0, currency = req.body.currency;

  for(var i = 0; i < req.body.classData.length; i++){
    var _data = {
      studentID: req.user._id,
      teacherID: req.body.teacherID,
      requestedTime: {
        start: (moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').valueOf()),
        end: (moment(req.body.classData[i].end, 'YYYY-MM-DD HH:mm').valueOf()),
        dateFormated: moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').format('MMM DD, YYYY'),
        startFormated: moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').format('HH:mm'),
        endFormated: moment(req.body.classData[i].end, 'YYYY-MM-DD HH:mm').format('HH:mm')
      },
      amount: {
        currency: req.body.classData[i].currency,
        cost: req.body.classData[i].cost
      }
    }
    classData.push(_data);
    totalAmount += req.body.classData[i].cost;
  }
  User.findById(req.user._id, function (err, user){
    if(err) { return handleError(res, err); }
    var transactionData = {
      amount: totalAmount,
      currency: currency,
      classInfo: classData,
      productInfo: 'Class request',
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      email: user.email,
      phone: user.phone || 7777777777,
      status: 'Not Started'
    }
    Transaction.create(transactionData, function(err, transaction) {
      if(err) { return handleError(res, err); }
      var generatedHash = hashBeforeTransaction({
        'key': key,
        'txnid': transaction._id,
        'amount': totalAmount,
        'productinfo': 'Class request',
        'firstname': user.name.firstName,
        'email': user.email
      });

      console.log("key >>> " + key);

      var generatedresponse = {
        'key': key,
        'txnid': transaction._id,
        'firstname': user.name.firstName,
        'lastname': user.name.lastname,
        'email': user.email,
        'phone': '7777777777',
        'productinfo': 'Class request',
        'amount': totalAmount,
        'surl': 'http://localhost:9000/success',
        'furl': 'http://localhost:9000/failure',
        'hash': generatedHash,
        'service_provider': '',
        'address1': '',
        'address2': '',
        'city': '',
        'state': '',
        'country': '',
        'zipcode': '',
        'udf1': '',
        'udf2': '',
        'udf3': '',
        'udf4': '',
        'udf5': '',
        'udf6': '',
        'udf7': '',
        'udf8': '',
        'udf9': '',
        'udf10': ''
      }
      return res.status(201).json(generatedresponse);
    });
  })
};
// Get list of transactions
exports.index = function(req, res) {
  Transaction.find(function (err, transactions) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(transactions);
  });
};

// Get a single transaction
exports.show = function(req, res) {
  Transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.status(404).send('Not Found'); }
    return res.json(transaction);
  });
};

// Creates a new transaction in the DB.
exports.create = function(req, res) {
  Transaction.create(req.body, function(err, transaction) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(transaction);
  });
};

// Updates an existing transaction in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Transaction.findById(req.params.id, function (err, transaction) {
    if (err) { return handleError(res, err); }
    if(!transaction) { return res.status(404).send('Not Found'); }
    var updated = _.merge(transaction, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(transaction);
    });
  });
};

// Deletes a transaction from the DB.
exports.destroy = function(req, res) {
  Transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.status(404).send('Not Found'); }
    transaction.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

function hashBeforeTransaction(data) {
  var string = "";
  var sequence = hashSequence.split('|');
  if (!(data && salt)){
    return false;
  }
  for (var i = 0; i < sequence.length; i++) {
    var k = sequence[i];
    if(data[k] !== undefined){
      string += data[k] + '|';
    }else{
          string += '|';
    }
  }
  string += salt;
  return crypto.createHash('sha512', salt).update(string).digest('hex');
}