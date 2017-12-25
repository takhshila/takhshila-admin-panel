'use strict';

var _ = require('lodash'),
    http = require('http'),
    https = require('https'),
    request = require('request'),
    crypto = require('crypto'),
    moment = require('moment'),
    schedule = require('node-schedule'),
    querystring = require('querystring'),
    User = require('../user/user.model'),
    Wallet = require('../wallet/wallet.model'),
    config = require('../../config/environment'),
    Transaction = require('./transaction.model'),
    Userclass = require('../userclass/userclass.model'),
    Scheduler = require('../scheduler/scheduler.model'),
    BankAccount = require('../bankAccount/bankAccount.model'),
    Notification = require('../notification/notification.model'),
    Transactionhistory = require('../transactionhistory/transactionhistory.model'),
    transactionHistoryController = require('../transactionhistory/transactionhistory.controller'),
    hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10",
    tempClassData = [];

var eventEmitter;

exports.setEvenetEmitter = function(emitter){
  eventEmitter = emitter;
  bindEvents();
};


// Get list of transactionhistorys
exports.index = function(req, res) {
  var userID = req.user.id;
  var perPage = 10;
  var page = req.query.page || 0;
  var userID = req.user._id;
  Transaction.find({
    userID: userID,
    transactionAmount: {$gt: 0}
  })
  .limit(perPage)
  .skip(perPage * page)
  .sort({
    dateTime: 'desc'
  })
  .populate('userID', 'name profilePhoto')
  .exec(function (err, transactions) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(transactions);
  });
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
                classInfo: JSON.stringify(classData),
                status: 'pending'
              }
              Transaction.create(transactionData, function(err, transaction) {
                if(err) { reject({status: 500, data: err}); }
                tempClassData[transaction._id] = classData;
                var generatedHash = hashBeforeTransaction({
                  'key': config.payu.key,
                  'txnid': transaction._id,
                  'amount': amountToPay,
                  'productinfo': 'Class request',
                  'firstname': user.name.firstName,
                  'email': user.email
                });

                var generatedresponse = {
                  'key': config.payu.key,
                  'txnid': transaction._id,
                  'firstname': user.name.firstName,
                  'lastname': user.name.lastname,
                  'email': user.email,
                  'phone': '7777777777',
                  'productinfo': 'Class request',
                  'amount': amountToPay,
                  'surl': config.siteBase + '/api/v1/transactions/payment/update',
                  'furl': config.siteBase + '/api/v1/transactions/payment/update',
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

                // var validateTransactionTime = moment().add(5, 'm').valueOf();
                var validateTransactionTime = moment().add(15, 's').valueOf();

                var j = schedule.scheduleJob(validateTransactionTime, function(transactionId){
                  validateTransaction(transactionId);
                }.bind(null,transaction._id));

                var schedulerData = [{
                  jobName:'scheduleValidateTransaction',
                  jobTime: validateTransactionTime,
                  jobData: JSON.stringify({transactionId: transaction._id}),
                  emitEvent: false,
                  callback: true,
                  callbackFunction: validateTransaction
                }];

                Scheduler.create(schedulerData, function(err, scheduler){
                  console.log("Scheduler job created");
                });

                resolve({
                  paymentRequired: true,
                  paymentData: generatedresponse
                });
              });
            }else{
              var transactionData = {
                userID: user._id,
                transactionType: 'Credit',
                transactionIdentifier: 'walletCashReceived',
                transactionDescription: 'Wallet cash for INR ' + amountToPay + ' received',
                transactionAmount: parseFloat(amountToPay),
                classInfo: JSON.stringify(classData),
                status: 'success'
              }
              Transaction.create(transactionData, function(err, transaction){
                bookClass(classData)
                .then(function(response){
                  resolve({
                    paymentRequired: false,
                    paymentData: null,
                    transactionId: transaction._id
                  });
                })
                .catch(function(err){
                  reject(err);
                });
              })
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

// Get a single transaction
exports.getTransactionData = function(req, res) {
  var userID = req.user._id;
  Transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction || transaction.userID.toString() !== userID.toString()){
      return res.status(404).send('Not Found');
    }
    delete transaction.transactionData;
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
  console.log(transactionData);
  var updatePaymentPromise = new Promise(function(resolve, reject){
    processPaymentResponse(transactionData)
    .then(function(walletData){
      var classData = tempClassData[transactionData.txnid];
      if(classData){
        bookClass(classData, transactionData.txnid)
        .then(function(response){
          delete tempClassData[transactionData.txnid];
          resolve(response);
        })
        .catch(function(err){
          delete tempClassData[transactionData.txnid];
          reject();
        });
      }else{
        reject();
      }
    })
    .catch(function(err){
      reject();
    });
  });
  updatePaymentPromise
  .then(function(data){
    return res.redirect('/class/success/' + transactionData.txnid);
  })
  .catch(function(err){
    return res.redirect('/class/failure/' + transactionData.txnid);
  });
};

// Initiate withdrawal transaction in the DB.
exports.initiateWithdraw = function(req, res) {
  var userID = req.params.id;
  var updateWithdrawPromise = new Promise(function(resolve, reject){
    Wallet.findOne({
      userID: userID
    }, function(err, walletData){
      if(err){ reject({status: 403, data: err}); }
      var withdrawBalance = walletData.withdrawBalance;
      if(withdrawBalance >  0){
        BankAccount
        .findOne({
          userID: userID
        })
        .populate('bankID')
        .exec(function(err, bankAccountData){
          if(err){ reject({status: 403, data: err}); }
          if(bankAccountData && bankAccountData.bankID){
            var transactionData = {
              userID: userID,
              transactionType: 'Debit',
              transactionIdentifier: 'walletCashDeducted',
              transactionDescription: 'Wallet cash deducted for auto withdraw.',
              transactionAmount: withdrawBalance,
              status: 'pending'
            };
            Transaction.create(transactionData, function(err, transaction){
              if(err){ reject({status: 403, data: err}); }
              walletData.nonWithdrawBalance = walletData.nonWithdrawBalance + withdrawBalance;
              walletData.withdrawBalance = walletData.withdrawBalance - withdrawBalance;
              walletData.totalBalance = walletData.totalBalance - withdrawBalance;
              walletData.withdrawlRefrence = transaction._id;
              walletData.save(function(err){
                if(err){ reject({status: 403, data: err}); }
                resolve(bankAccountData);
              });
            });
          }else{
            reject({status: 403, data: 'User does not have bank account linked to his account.'});
          }
        })
      }else{
        reject({status: 403, data: 'Insufficient wallet balance to be withdrawn'});
      }
    });
  });

  updateWithdrawPromise
  .then(function(data){
    return res.status(201).json(data);
  })
  .catch(function(err){
    return res.status(err.status).send(err.data);
  });
};

// Initiate withdrawal transaction in the DB.
exports.completeWithdraw = function(req, res) {
  var userID = req.params.id;
  var transactionDetails = req.body;
  var updateWithdrawPromise = new Promise(function(resolve, reject){
    if(transactionDetails && transactionDetails.impsTransactionID){
      Wallet.findOne({
        userID: userID
      })
      .populate('withdrawlRefrence')
      .exec(function(err, walletData){
        if(err){ reject({status: 403, data: err}); }
        if(walletData.nonWithdrawBalance > 0){
          if(walletData.withdrawlRefrence){
            if(walletData.withdrawlRefrence.transactionAmount > 0){
              var transactionData = walletData.withdrawlRefrence;
              transactionData.status = 'success';
              transactionData.transactionData = transactionDetails;
              transactionData.save(function(err){
                if(err){ reject({status: 403, data: err}); }
                walletData.nonWithdrawBalance = walletData.nonWithdrawBalance - walletData.withdrawlRefrence.transactionAmount;
                walletData.withdrawlRefrence = null;
                walletData.save(function(err){
                  if(err){ reject({status: 403, data: err}); }
                  resolve(walletData);
                })
              });
            }else{
              reject({status: 403, data: 'Invalid amount initiated to be withdrawn'});
            }
          }else{
            reject({status: 403, data: 'The withdrawal has not been initiated.'});
          }
        }else{
          reject({status: 403, data: 'Insufficient wallet balance to be withdrawn'});
        }
      });
    }else{
      reject({status: 403, data: 'Please specify the IMPS transaction ID.'});
    }
  });

  updateWithdrawPromise
  .then(function(data){
    return res.status(201).json(data);
  })
  .catch(function(err){
    return res.status(err.status).send(err.data);
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
  if (!(data && config.payu.salt)){
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
  string += config.payu.salt;
  return crypto.createHash('sha512', config.payu.salt).update(string).digest('hex');
}

function hashAfterTransaction(data, transactionStatus) {
  var k = "",
      string = "";

  var sequence = hashSequence.split('|').reverse();
  if (!(data && config.payu.salt && transactionStatus)){
    return false;
  }

  string += config.payu.salt + '|' + transactionStatus + '|';
  for (var i = 0; i < sequence.length; i++) {
    k = sequence[i];
    if(data[k] !== undefined){
      string += data[k] + '|';
    }else{
      string += '|';
    }
  }

  string = string.substr(0, string.length - 1);

  return crypto.createHash('sha512', config.payu.salt).update(string).digest('hex');
}

function validateTransaction(transactionId){
  console.log("Validating transaction with ID: " + transactionId);
  Transaction.findById(transactionId, function (err, transaction){
    if(transaction.status === 'pending'){
      console.log("Transaction found and status is pending");
      getTransactionResponse(
        config.payu.host, 
        config.payu.path.paymentResponse, 
        {
          merchantKey: config.payu.key,
          merchantTransactionIds: transactionId
        }, 
        'POST', 
        config.payu.authorizationHeader
      )
      .then(function(transactionData){
        console.log("Transaction response received from API");
        processPaymentResponse(transactionData)
        .then(function(walletData){
          var classData = tempClassData[transactionData.txnid];
          if(classData){
            bookClass(classData, transactionId)
            .then(function(response){
            	delete tempClassData[transaction._id];
            })
            .catch(function(err){
            	delete tempClassData[transaction._id];
            });
          }else{
            console.log('Class data was not found');
          }
        })
        .catch(function(err){
          console.log("Transaction error received from API");
          console.log(err);
          transaction.status = 'Failure';
          transaction.transactionData = err;
          transaction.save(function(err){
            console.log('Transaction failed');
          });
        });
      })
      .catch(function(err){
        console.log("An err received");
        console.log(err);
        transaction.status = 'Failed';
        transaction.transactionData = err;
        transaction.save(function(err){
          console.log('Transaction failed');
        });
        // Transaction.findById(transactionId, function (err, transaction){
        //   if(!transaction) { console.log('Transaction Not Found'); }
        //   transaction.status = 'Failed';
        //   transaction.transactionData = err;
        //   transaction.save(function(err){
        //     console.log('Transaction failed');
        //   });
        // });
      })
    }
  })
}

function getTransactionResponse(host, path, queryParams, method, authorizationHeader, body){
  return new Promise(function(resolve, reject){
    var url = host + path;
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
      if (!error && response.statusCode == 200) {
          // Print out the response body
          var jsonResponse = JSON.parse(body);
          if(jsonResponse.status !== -1){
            reject(jsonResponse);
          }else{
            resolve(jsonResponse);
          }
      }else{
        reject(error);
      }
    });
  });
}

function bookClass(classData, paymentRefrence){
  return new Promise(function(resolve, reject){
    var tempWalletData = null;
    Wallet.findOne({
      userID: classData[0].studentID
    })
    .exec(function(err, walletData){
      tempWalletData = walletData;
      isClassAvailable(classData)
      .then(function(response){
      	if(response){
	      var bookClassPromise = classData.map(function(singleClassData){
	        var userID = singleClassData.studentID;
	        var totalAmount = parseFloat(singleClassData.amount.totalCost);

	        return new Promise(function(resolve, reject){
	          var usedPromoBalance = 0;
	          var usedWithdrawBalance = 0;

	          var walletBalance = tempWalletData.totalBalance;
	          var nonWithdrawBalance = tempWalletData.nonWithdrawBalance;
	          var withdrawBalance = tempWalletData.withdrawBalance;
	          var promoBalance = tempWalletData.promoBalance;
	          var bookingBalance = parseFloat(withdrawBalance + promoBalance);

	          if(promoBalance >= totalAmount){
	            usedPromoBalance = totalAmount;
	          }else{
	            usedPromoBalance = tempWalletData.promoBalance;
	            usedWithdrawBalance = parseFloat(totalAmount - tempWalletData.promoBalance);
	          }

	          // console.log('totalAmount = ' + totalAmount);
	          // console.log('usedPromoBalance = ' + usedPromoBalance);
	          // console.log('usedWithdrawBalance = ' + usedWithdrawBalance);

	          tempWalletData.withdrawBalance = parseFloat(tempWalletData.withdrawBalance - usedWithdrawBalance);
	          tempWalletData.promoBalance = parseFloat(tempWalletData.promoBalance - usedPromoBalance);
	          tempWalletData.nonWithdrawBalance = parseFloat(tempWalletData.nonWithdrawBalance + totalAmount);
	              
	          singleClassData.status = 'requested';
	          singleClassData.amount.promoBalance = usedPromoBalance;
	          singleClassData.amount.withdrawBalance = usedWithdrawBalance;
	          if(paymentRefrence){ singleClassData.paymentRefrence = paymentRefrence; }

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
	              var notificationData = {
	                forUser: userclass.teacherID,
	                fromUser: userclass.studentID,
	                notificationType: 'classRequest',
	                notificationStatus: 'unread',
	                notificationMessage: 'Test Message',
	                referenceClass: userclass._id
	              }
	              Notification.create(notificationData, function(err, notification){

	                var cancelClassIfNotApprovedTime = moment.unix(userclass.requestedTime.start/1000).subtract(60, 'm').valueOf();

	                var schedulerData = [{
	                  jobName:'scheduleCancelClassIfNotApproved',
	                  jobTime: cancelClassIfNotApprovedTime,
	                  jobData: JSON.stringify({classId: userclass._id}),
	                  emitEvent: true,
	                  eventName: 'cancelClassIfNotApproved',
	                  callback: false
	                }];
	                var cancelClassIfNotApprovedJob = schedule.scheduleJob(cancelClassIfNotApprovedTime, function(classId){
	                  eventEmitter.emit('cancelClassIfNotApproved', {
	                    classId: classId
	                  });
	                }.bind(null,userclass._id));

	                var timeToStartClass = (moment.unix(userclass.requestedTime.start/1000).valueOf() - moment().valueOf())/(3600 * 1000);
	                // console.log(moment().add(900, 'm').valueOf());
	                // console.log(moment.unix(userclass.requestedTime.start/1000).valueOf());
	                // console.log(moment().add(900, 'm').valueOf() < moment.unix(userclass.requestedTime.start/1000).valueOf());
	                // console.log("timeToStartClass => " + timeToStartClass);
	                if(timeToStartClass >= 15){
	                  var notifyUserIfClassNotApprovedTime = moment().add(600, 'm').valueOf();
	                  schedulerData.push({
	                    jobName:'scheduleNotifyUserIfClassNotApproved',
	                    jobTime: notifyUserIfClassNotApprovedTime,
	                    jobData: JSON.stringify({classId: userclass._id}),
	                    emitEvent: true,
	                    eventName: 'notifyUserIfClassNotApproved',
	                    callback: false
	                  });
	                  var notifyUserIfClassNotApprovedJob = schedule.scheduleJob(notifyUserIfClassNotApprovedTime, function(classId){
	                    eventEmitter.emit('notifyUserIfClassNotApproved', {
	                      classId: classId
	                    });
	                  }.bind(null,userclass._id));
	                }

	                Scheduler.create(schedulerData, function(err, scheduler){
	                  console.log("Scheduler job created");
	                });

	                eventEmitter.emit('newClassRequestNotification', {
	                  classId: userclass._id
	                });
	                resolve(userclass);
	              });
	            });
	          });
	        });
	      });

	      Promise.all(bookClassPromise)
	      .then(function(data){
	        tempWalletData.save(function(err){
	          console.log('wallet data updated');
	          resolve(data);
	        });
	      })
	      .catch(function(err){
	        reject(err);
	      });
      	}else{
      		reject({status: 403, data: 'One of the class requested is not available.'})
      	}
      });
    });
  });
}

function isClassAvailable(classData){
  return new Promise(function(resolve, reject){
	var _currentTime = moment().valueOf();
	Userclass.find({
		teacherID: classData[0].teacherID,
		'requestedTime.start': {$gte: _currentTime},
		'status': {$in: ['requested', 'confirmed', 'pendingPayment']}
	})
	.exec(function(err, bookedClassList){
		if(bookedClassList.length > 0){
			var _bookedClasses = {};
			var matchFound = false;
			for(var a = 0; a < bookedClassList.length; a++){
				var _bookedClassStart = parseInt(bookedClassList[a].requestedTime.start);
				var _bookedClassEnd = parseInt(bookedClassList[a].requestedTime.end);
				var _bookedTimeDifference = (_bookedClassEnd - _bookedClassStart) / (60*1000);
				if(_bookedTimeDifference > 30){
					do{
						_bookedClasses[_bookedClassStart] = {
							start: _bookedClassStart,
							end: _bookedClassStart + (30 * 60 * 1000),
							dateTime: moment(_bookedClassStart).format("MMM DD, YYYY HH:mm a"),
							status: bookedClassList[a].status
						}
						_bookedClassStart += (30 * 60 * 1000);
						_bookedTimeDifference -= 30;
					}while (_bookedTimeDifference >= 30)
				}else{
					_bookedClasses[_bookedClassStart] = {
						start: _bookedClassStart,
						end: _bookedClassEnd,
						dateTime: moment(_bookedClassStart).format("MMM DD, YYYY HH:mm a"),
						status: bookedClassList[a].status
					};
				}
			}
			for(var b = 0; b < classData.length; b++){
				var difference = (classData[b].requestedTime.end - classData[b].requestedTime.start)/(60*1000);
				if(difference > 30){
					var startDateTime = classData[b].requestedTime.start;
					do{
						if(_bookedClasses[startDateTime] !== undefined){
							matchFound = true;
							break;
						}
						startDateTime += (30 * 60 * 1000);
						difference -= 30;
					}while(difference >= 30)
				}else{
					if(_bookedClasses[classData[b].requestedTime.start] !== undefined){
						matchFound = true;
						break;
					}
				}
				if(matchFound){
					break;
				}
			}
			if(matchFound){
				resolve(false)
			}else{
				resolve(true);
			}
		}else{
			resolve(true);
		}
	});
  });
}

function processPaymentResponse(transactionData, transactionType){
  if(!transactionType){ transactionType = 'paymentReceived'; }
  return new Promise(function(resolve, reject){
    var generatedHash = hashAfterTransaction(transactionData, transactionData.status);
    if(generatedHash === transactionData.hash){
      var transactionId = transactionData.txnid;
      Transaction.findById(transactionId, function (err, transaction){
        if(!transaction) { return res.status(404).send('Not Found'); }
        var userID = transaction.userID;
        var transactionAmount = transaction.transactionAmount;

        transaction.status = transactionData.status;
        transaction.transactionData = transactionData;
        transaction.save(function(err){
          if(transactionData.status === 'success'){
            Wallet.findOne({
              userID: userID
            })
            .exec(function(err, walletData){
              walletData.totalBalance = parseFloat(walletData.totalBalance + transactionAmount);
              walletData.withdrawBalance = parseFloat(walletData.withdrawBalance + transactionAmount);
              walletData.save(function(err, updatedWalletData){
                resolve(updatedWalletData);
              });
            });
          }else{
            reject(transactionData);
          }
        });
      });
    }else{
      reject('Invalid hash');
    }
  });
}


function bindEvents(){
  eventEmitter.on('scheduleValidateTransaction', function(data){
    console.log("event scheduleValidateTransaction received for " + parseInt(data.time));
    console.log("event scheduleValidateTransaction received " + data.data.transactionId);
    var j = schedule.scheduleJob(parseInt(data.time), function(transactionId){
      validateTransaction(transactionId);
    }.bind(null,data.data.transactionId));
  });
}
