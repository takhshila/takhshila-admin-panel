'use strict';

var _ = require('lodash'),
    http = require('http'),
    https = require('https'),
    request = require('request'),
    crypto = require('crypto'),
    moment = require('moment'),
    querystring = require('querystring'),
    Transaction = require('./transaction.model'),
    User = require('../user/user.model'),
    Userclass = require('../userclass/userclass.model'),
    Wallet = require('../wallet/wallet.model'),
    Notification = require('../notification/notification.model'),
    Transactionhistory = require('../transactionhistory/transactionhistory.model'),
    transactionHistoryController = require('../transactionhistory/transactionhistory.controller'),
    schedule = require('node-schedule'),
    hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10",
    merchantID = 4934580,
    key = 'rjQUPktU',
    salt = 'e5iIg1jwi8',
    authorizationHeader = 'y8tNAC1Ar0Sd8xAHGjZ817UGto5jt37zLJSX/NHK3ok=',
    tempClassData = [],
    payu = {
      merchantID: 4934580,
      key: 'rjQUPktU',
      salt: 'e5iIg1jwi8',
      authorizationHeader: 'y8tNAC1Ar0Sd8xAHGjZ817UGto5jt37zLJSX/NHK3ok=',
      host: 'https://test.payumoney.com',
      path: {
        paymentResponse: '/payment/op/getPaymentResponse'
      }
    };


// Initiate transactions
exports.initiatePayment = function(req, res) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  if(!req.body.classData.length){return handleError(res, 'Invalid class data');}
  
  var classData = [], totalAmount = 0, totalReceivedAmount = 0, currency = req.body.currency, userclassList = [];

  var initiatePaymentPromise = new Promise(function(resolve, reject){
    User.findById(req.body.teacherID, function(err, teacher){
      if(err) { reject({status: 500, data: err}); }
      var ratePerHour = teacher.ratePerHour.value;
      var currency = teacher.ratePerHour.currency;

      for(var i = 0; i < req.body.classData.length; i++){
        var totalClassHour = (moment(req.body.classData[i].end, 'YYYY-MM-DD HH:mm').valueOf() - moment(req.body.classData[i].start, 'YYYY-MM-DD HH:mm').valueOf())/(60*60*1000);
        var totalClassAmount = (parseFloat(totalClassHour) * parseFloat(ratePerHour)).toFixed(2);
        var amountPaidToTeacher = (parseFloat(totalClassHour) * parseFloat((ratePerHour - (0.2 * ratePerHour)))).toFixed(2);
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
            currency: currency,
            totalCost: totalClassAmount,
            paidToTeacher: amountPaidToTeacher
          }
        }
        classData.push(_data);
        totalAmount += parseFloat(totalClassAmount);
        totalReceivedAmount += parseFloat(req.body.classData[i].cost);
      }

      if(parseFloat(totalReceivedAmount) === parseFloat(totalAmount)){
        var amountToPay = totalAmount;
        var usedWithdrawBalance = 0;
        var usedPromoBalance = 0;

        User.findById(req.user._id, function (err, user){
          if(err) { reject({status: 500, data: err}); }
          Wallet.findOne({
            userID: user._id
          }, function(err, walletData){
            if(err) { reject({status: 500, data: err}); }
            var walletBalance = walletData.totalBalance;
            var nonWithdrawBalance = walletData.nonWithdrawBalance;
            var withdrawBalance = walletData.withdrawBalance;
            var promoBalance = walletData.promoBalance;
            var bookingBalance = parseFloat(withdrawBalance + promoBalance);

            if(promoBalance >= totalAmount){
              usedPromoBalance = totalAmount;
              amountToPay = 0;
            }else if(bookingBalance >= totalAmount){
              usedPromoBalance = walletData.promoBalance;
              usedWithdrawBalance = totalAmount - promoBalance;
              amountToPay = 0;
            }else if(bookingBalance > 0){
              amountToPay = parseFloat(totalAmount - bookingBalance);
              usedPromoBalance = walletData.promoBalance;
              usedWithdrawBalance = bookingBalance - promoBalance;
            }

            if(amountToPay > 0){

              var transactionData = {
                userID: user._id,
                transactionType: 'Credit',
                transactionIdentifier: 'walletCashReceived',
                transactionDescription: 'Wallet cash for INR ' + amountToPay + ' received',
                transactionAmount: parseFloat(amountToPay),
                status: 'pending'
              }
              Transaction.create(transactionData, function(err, transaction) {
                if(err) { reject({status: 500, data: err}); }
                tempClassData[transaction._id] = classData;
                var generatedHash = hashBeforeTransaction({
                  'key': key,
                  'txnid': transaction._id,
                  'amount': amountToPay,
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
                  'amount': amountToPay,
                  'surl': 'http://localhost:9000/api/v1/transactions/payment/update',
                  'furl': 'http://localhost:9000/api/v1/transactions/payment/update',
                  'hash': generatedHash,
                  'service_provider': 'payu_paisa',
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

                var validateTransactionTime = moment().add(5, 'm').valueOf();

                var j = schedule.scheduleJob(validateTransactionTime, function(transactionId){
                  validateTransaction(transactionId);
                }.bind(null,transaction._id));

                resolve({
                  paymentRequired: true,
                  paymentData: generatedresponse
                });
              });
            }else{
              bookClass(classData)
              .then(function(response){
                resolve({
                  paymentRequired: false,
                  paymentData: null
                });
              })
              .catch(function(err){
                reject(err);
              });
            }
          });
        });

      }else{
        reject({status: 403, data: 'Invalid cost provided'});
      }
    });
  });
  initiatePaymentPromise.then(function(response){
    return res.status(201).json(response);
  })
  .catch(function(err){
    console.log(err);
    return res.status(err.status).send(err.data);
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
  var transaction = null;
  var transactionData = req.body;
  // var generatedHash = hashAfterTransaction(transactionData, transactionData.status);
  console.log("transactionData");
  console.log(req.body);
  getTransactionResponse(payu.host, payu.path.paymentResponse, {
    merchantKey: payu.key,
    merchantTransactionIds: '59afca62eefbea200c05b58c'
  }, 'POST', payu.authorizationHeader);

  return res.status(204).send('No Content');

  if(generatedHash === transactionData.hash){
    var transactionId = transactionData.txnid;
    var transactionPromise = new Promise(function(resolve, reject){
      Transaction.findById(transactionId, function (err, transaction){
        // if (err) { return handleError(res, err); }
        if(!transaction) { return res.status(404).send('Not Found'); }
        var userID = transaction.userID;
        var transactionAmount = transaction.transactionAmount;
        var classData = tempClassData[transaction._id];

        transaction.status = transactionData.status;
        transaction.transactionData = transactionData;
        transaction.save(function(err){
          Wallet.findOne({
            userID: userID
          })
          .exec(function(err, walletData){
            walletData.totalBalance = parseFloat(walletData.totalBalance + transactionAmount);
            walletData.withdrawBalance = parseFloat(walletData.withdrawBalance + transactionAmount);
            walletData.save(function(err, updatedWalletData){
              bookClass(classData)
              .then(function(response){
                delete tempClassData[transaction._id];
                resolve(response);
              })
              .catch(function(err){
                reject(err);
              });
            });
          });
        });
      });
    });

    transactionPromise
    .then(function(data){
      return res.redirect('/profile');
    })
    .catch(function(err){
      console.log(err);
      return res.redirect('/payment/failure/');
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
    if(transaction.status === 'pending'){
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

function getTransactionResponse(host, path, queryParams, method, authorizationHeader, body){
  var url = host + path;
  // if(body){ body = querystring.stringify(body); }else{ body = ''; }

  // const options = {
  //   hostname: host,
  //   path: path,
  //   method: method,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': Buffer.byteLength(body),
  //   }
  // };


  // Set the headers
  var headers = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/json'
  }
  if(authorizationHeader){ headers.Authorization = authorizationHeader }

  // Configure the request
  var options = {
      url: url,
      method: method,
      headers: headers,
      qs: queryParams
  }

  // Start the request
  request(options, function (error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);
      if (!error && response.statusCode == 200) {
          // Print out the response body
          console.log(body)
      }
  })

  // console.log("options Data");
  // console.log(options);

  // const req = https.request(options, (res) => {
  //   console.log(`STATUS: ${res.statusCode}`);
  //   console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  //   res.setEncoding('utf8');
  //   res.on('data', (chunk) => {
  //     console.log(`BODY: ${chunk}`);
  //   });
  //   res.on('end', () => {
  //     console.log('No more data in response.');
  //   });
  // });

  // req.on('error', (e) => {
  //   console.error(`problem with request: ${e.message}`);
  // });

  // // Send the request
  // req.write(body);
  // req.end();
}

function bookClass(classData){
  return new Promise(function(resolve, reject){
    var bookClassPromise = classData.map(function(singleClassData){
      var userID = singleClassData.studentID;
      var totalAmount = parseFloat(singleClassData.amount.totalCost);

      return new Promise(function(resolve, reject){
        Wallet.findOne({
          userID: userID
        })
        .populate('userID')
        .exec(function(err, walletData){            
          var usedPromoBalance = 0;
          var usedWithdrawBalance = 0;

          var walletBalance = walletData.totalBalance;
          var nonWithdrawBalance = walletData.nonWithdrawBalance;
          var withdrawBalance = walletData.withdrawBalance;
          var promoBalance = walletData.promoBalance;
          var bookingBalance = parseFloat(withdrawBalance + promoBalance);

          if(promoBalance >= totalAmount){
            usedPromoBalance = totalAmount;
          }else{
            usedPromoBalance = walletData.promoBalance;
            usedWithdrawBalance = totalAmount - promoBalance;
          }

          singleClassData.status = 'requested';
          singleClassData.amount.promoBalance = usedPromoBalance;
          singleClassData.amount.withdrawBalance = usedWithdrawBalance;

          Userclass.create(singleClassData, function(err, userclass){
            var transactionData = {
              userID: userID,
              transactionType: 'Debit',
              transactionIdentifier: 'walletCashDeducted',
              transactionDescription: 'Wallet cash deducted for class booking',
              transactionAmount: totalAmount,
              classRefrence: userclass._id,
              status: 'completed'
            }

            Transaction.create(transactionData, function(err, transaction){
              walletData.withdrawBalance = parseFloat(walletData.withdrawBalance - usedWithdrawBalance);
              walletData.promoBalance = parseFloat(walletData.promoBalance - usedPromoBalance);
              walletData.nonWithdrawBalance = parseFloat(walletData.nonWithdrawBalance + totalAmount);

              walletData.save(function(err){
                var notificationData = {
                  forUser: singleClassData.teacherID,
                  fromUser: singleClassData.studentID,
                  notificationType: 'classRequest',
                  notificationStatus: 'unread',
                  notificationMessage: 'Test Message',
                  referenceClass: singleClassData._id
                }
                Notification.create(notificationData, function(err, notification){
                  resolve(singleClassData);
                });
              });
            });
          });
        });
      });
    });

    Promise.all(bookClassPromise)
    .then(function(data){
      resolve(data);
    })
    .catch(function(err){
      reject(err);
    })
  });
}