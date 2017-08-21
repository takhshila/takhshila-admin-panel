'use strict';

var _ = require('lodash'),
    crypto = require('crypto'),
    moment = require('moment'),
    Transaction = require('./transaction.model'),
    User = require('../user/user.model'),
    Userclass = require('../userclass/userclass.model'),
    Notification = require('../notification/notification.model'),
    schedule = require('node-schedule'),
    hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10",
    merchantID = 5804204,
    key = 'gtKFFx',
    salt = 'eCwWELxi';


// Initiate transactions
exports.initiatePayment = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(!req.body.classData.length){return handleError(res, 'Invalid class data');}
  
  var classData = [], totalAmount = 0, currency = req.body.currency, userclassList = [];

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
  var createClassPromise = new Promise(function(resolve, reject){
    Userclass.create(classData, function(err, userclass){
      resolve(userclass);
    });
  });
  createClassPromise.then(function(data){
    User.findById(req.user._id, function (err, user){
      if(err) { return handleError(res, err); }
      var transactionData = {
        amount: totalAmount,
        currency: currency,
        classInfo: data,
        productInfo: 'Class request',
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        email: user.email,
        phone: user.phone || 7777777777,
        status: 'initiated'
      }
      Transaction.create(transactionData, function(err, transaction) {
        if(err) { return handleError(res, err); }
        
        var validateTransactionTime = moment().add(1, 'm').valueOf();
        
        // var minute = moment(validateTransactionTime).minute();
        // var hour = moment(validateTransactionTime).hour();
        // var date = moment(validateTransactionTime).date();
        // var month = moment(validateTransactionTime).month();
        // var dayOfWeek = moment(validateTransactionTime).weekday();

        var j = schedule.scheduleJob(validateTransactionTime, function(transactionId){
          validateTransaction(transactionId);
        }.bind(null,transaction._id));

        var generatedHash = hashBeforeTransaction({
          'key': key,
          'txnid': transaction._id,
          'amount': totalAmount,
          'productinfo': 'Class request',
          'firstname': user.name.firstName,
          'email': user.email
        });

        var generatedresponse = {
          'key': key,
          'txnid': transaction._id,
          'firstname': user.name.firstName,
          'lastname': user.name.lastname,
          'email': user.email,
          'phone': '7777777777',
          'productinfo': 'Class request',
          'amount': totalAmount,
          'surl': 'http://localhost:9000/api/v1/transactions/payment/update',
          'furl': 'http://localhost:9000/api/v1/transactions/payment/update',
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
  })
  .catch(function(err){

  });
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
exports.updatePayment = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  console.log(req.body);
  var transactionData = req.body;
  var generatedHash = hashAfterTransaction(transactionData, transactionData.status);

  if(generatedHash === transactionData.hash){
    var transactionId = transactionData.txnid;
    Transaction.findById(transactionId, function (err, transaction) {
      if (err) { return handleError(res, err); }
      if(!transaction) { return res.status(404).send('Not Found'); }

      var _classData = transaction.classInfo;
      transaction.status = transactionData.status;
      transaction.transactionData = transactionData;
      transaction.save(function(err){
        if (err) { return handleError(res, err); }
        var transactionProcessingPromise = _classData.map(function(data, i){
          return new Promise(function(resolve, reject){
            var classId = _classData[i]._id;
            Userclass.findOne({
              _id: classId
            }, function(err, classData){
              if (err) { return handleError(res, err); }
              if(transactionData.status === 'success'){
                classData.status = 'requested';
                classData.save(function(err){
                  if (err) { return handleError(res, err); }
                  var _notificationData = {
                    forUser: classData.teacherID,
                    fromUser: classData.studentID,
                    notificationType: 'classRequest',
                    notificationStatus: 'unread',
                    notificationMessage: 'Test Message',
                    referenceClass: classData._id
                  }
                  Notification.create(_notificationData, function(err, notification){
                    if (err) { return handleError(res, err); }
                  });
                });
              }else{
                classData.remove(function(err){
                  if (err) { return handleError(res, err); }
                  resolve();
                });
              }
            })
          })
        });
        Promise.all(transactionProcessingPromise)
        .then(function(data){
          if(transactionData.status === 'success'){
            return res.redirect('/profile');
          }else{
            return res.redirect('/payment/failure/');
          }
        })
        .catch(function(err){
          return handleError(res, err);
        })
      })
    });
  }else{
    return res.redirect('/payment/failure/');
  }
  
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

function hashAfterTransaction(data, transactionStatus) {
  var k = "",
      string = "";

  var sequence = hashSequence.split('|').reverse();
  if (!(data && salt && transactionStatus)){
    return false;
  }

  string += salt + '|' + transactionStatus + '|';
  for (var i = 0; i < sequence.length; i++) {
    k = sequence[i];
    if(data[k] !== undefined){
      string += data[k] + '|';
    }else{
      string += '|';
    }
  }

  string = string.substr(0, string.length - 1);

  return crypto.createHash('sha512', salt).update(string).digest('hex');
}

function validateTransaction(transactionId){
  Transaction.findById(transactionId, function (err, transaction){
    if(transaction.status === 'initiated'){
      var classData = transaction.classInfo;
      transaction.status = 'unprocessed';
      transaction.save(function(err){
        // if (err) { return handleError(res, err); }
        classData.map(function(data, i){
          var classId = classData[i]._id;
          Userclass.findOne({
            _id: classId
          }, function(err, classData){
            classData.remove(function(err){
              // if (err) { return handleError(res, err); }
            });
          });
        });
      });
    }
  })
}