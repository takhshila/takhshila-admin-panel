'use strict';

var _ = require('lodash');
var moment = require('moment');
var schedule = require('node-schedule');
var Userclass = require('./userclass.model');
var Wallet = require('../wallet/wallet.model');
var Transaction = require('../transaction/transaction.model');
var Review = require('../review/review.model');
var Scheduler = require('../scheduler/scheduler.model');
var Notification = require('../notification/notification.model');
var eventEmitter;

exports.setEvenetEmitter = function(emitter){
  eventEmitter = emitter;
  bindEvents();
};

// Get list of userclasss
exports.index = function(req, res) {
  var perPage = 10;
  var page = req.query.page || 0;
  var userID = req.user._id;
  var params = {
    $or: [
      {studentID: userID},
      {teacherID: userID}
    ]
  }
  var _currentTime = moment().valueOf();
  if(req.query.classType && req.query.classType === 'upcoming'){
    params['requestedTime.start'] = {$gte: _currentTime};
  }else if(req.query.classType && req.query.classType === 'past'){
    params['requestedTime.start'] = {$lte: _currentTime};
  }
  Userclass
  .find(params)
  .limit(perPage)
  .skip(perPage * page)
  .sort({
    requestedOn: 'asc'
  })
  .populate('studentID', 'name country profilePhoto')
  .populate('teacherID', 'name country profilePhoto')
  .exec(function (err, userclasss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(userclasss);
  });
};

// Get last userclasss based on review
exports.getLastClass = function(req, res) {
  var userID = req.user._id;
  var status = req.params.status;
  var _currentTime = moment().valueOf();
  var params = {
    $or: [
      {studentID: userID},
      {teacherID: userID}
    ],
    'requestedTime.start': {$lte: _currentTime}
  }

  var getLastClassPromise = new Promise(function(resolve, reject){
    Userclass
    .findOne(params)
    .sort({
      requestedOn: 'desc'
    })
    .populate('studentID', 'name country profilePhoto')
    .populate('teacherID', 'name country profilePhoto')
    .exec(function (err, userclasss) {
      if(err) { return reject(err); }
      if(!userclasss) { return reject('Not Found'); }
      resolve(userclasss);
    });
  });

  getLastClassPromise
  .then(function(response){
    return res.status(200).json(response);
  })
  .catch(function(err){
    return handleError(res, err);
  })
};

// Get a single userclass
exports.show = function(req, res) {
  Userclass.findById(req.params.id, function (err, userclass) {
    if(err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    return res.json(userclass);
  });
};

// Creates a new userclass in the DB.
exports.create = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(!req.body.classData.length){return handleError(res, 'Invalid class data');}
  var _classData = [];
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
      }
    }
    _classData.push(_data);
  }
  Userclass.create(_classData, function(err, userclass) {
    if(err) { return handleError(res, err); }
    for(var i = 0; i < userclass.length; i++){
      var _notificationData = {
        forUser: req.user._id,
        fromUser: req.body.teacherID,
        notificationType: 'classRequest',
        notificationStatus: 'unread',
        notificationMessage: 'Test Message',
        referenceClass: userclass[i]._id
      }
      Notification.create(_notificationData, function(err, notification){
        console.log(err);
        return res.status(201).json(userclass);
      });
    }
    
  });
};

// Confirm an existing userclass in the DB.
exports.confirmClassRequest = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Userclass.findById(req.params.id, function (err, userclass) {
    if (err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    if(userclass.status == "requested"){
      if(moment().valueOf() > moment.unix(userclass.requestedTime.start/1000).subtract(30, 'm').valueOf()){
        userclass.status = "cancelled";
      }else{
        userclass.status = "confirmed";
      }
      userclass.save(function (err) {
        if (err) { return handleError(res, err); }
        if(userclass.status === "confirmed"){
          // var notifyUserTimeTemp = moment().add(1, 'm').valueOf();
          var notifyUserTime = moment.unix(userclass.requestedTime.start/1000).subtract(5, 'm').valueOf();
          var checkClassStartTime = moment.unix(userclass.requestedTime.start/1000).add(15, 'm').valueOf();
          var endClassTime = moment.unix(userclass.requestedTime.start/1000).add(20, 'm').valueOf();
          // var endClassTime = moment.unix(userclass.requestedTime.end/1000).valueOf();

          // var jtemp = schedule.scheduleJob(notifyUserTimeTemp, function(classId){
          //   notifyUser(classId);
          // }.bind(null,userclass._id));

          var schedulerData = [{
            jobName:'schedulePriorClassNotification',
            jobTime: notifyUserTime,
            jobData: JSON.stringify({classId: userclass._id}),
            emitEvent: true,
            eventName: 'notifyUser',
            callback: false
          }, {
            jobName:'scheduleEndClass',
            jobTime: endClassTime,
            jobData: JSON.stringify({classId: userclass._id}),
            emitEvent: true,
            eventName: 'endClass',
            callback: true,
            callbackFunction: processEndClass
          }, {
            jobName:'scheduleCheckClassStart',
            jobTime: checkClassStartTime,
            jobData: JSON.stringify({classId: userclass._id}),
            emitEvent: true,
            eventName: 'checkClassStart',
            callback: true,
            callbackFunction: processEndClass
          }];

          Scheduler.create(schedulerData, function(err, scheduler){
            console.log("Scheduler job created");
          });

          var priorNotificationJob = schedule.scheduleJob(notifyUserTime, function(classId){
            eventEmitter.emit('notifyUser', {
              classId: classId
            });
          }.bind(null,userclass._id));

          var endClassJob = schedule.scheduleJob(endClassTime, function(classId){
            eventEmitter.emit('endClass', {
              classId: classId
            });
            processEndClass(classId);
          }.bind(null,userclass._id));

          var endClassJob = schedule.scheduleJob(checkClassStartTime, function(classId){
            eventEmitter.emit('checkClassStart', {
              classId: classId
            });
            processEndClass(classId);
          }.bind(null,userclass._id));

          var _notificationData = {
            forUser: userclass.studentID,
            fromUser: userclass.teacherID,
            notificationType: 'requestConfirmed',
            notificationStatus: 'unread',
            notificationMessage: 'Test Message',
            referenceClass: userclass._id
          }
          Notification.create(_notificationData, function(err, notification){
            console.log(err);
            eventEmitter.emit('notifyClassConfirmed', {
              classId: userclass._id
            });
            return res.status(201).json(userclass);
          });
        }
      });
    }else{
      return res.status(400).send("Invalid request type");
    }
  });
};
// Deny an existing userclass in the DB.

exports.denyClassRequest = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Userclass.findById(req.params.id, function (err, userclass) {
    if (err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    if(userclass.status == "requested"){
      userclass.status = "denied";
      userclass.save(function (err) {
        Wallet.findOne({
          userID: userclass.studentID
        }, function(err, walletData){
          // var refundAmount = parseFloat(userclass.amount.withdrawBalance);
          walletData.nonWithdrawBalance = parseFloat(walletData.nonWithdrawBalance - (userclass.amount.withdrawBalance + userclass.amount.promoBalance));
          walletData.withdrawBalance = parseFloat(walletData.withdrawBalance + userclass.amount.withdrawBalance);
          walletData.promoBalance = parseFloat(walletData.promoBalance + userclass.amount.promoBalance);
          walletData.totalBalance = parseFloat(walletData.totalBalance + (userclass.amount.withdrawBalance + userclass.amount.promoBalance));

          walletData.save(function(err){
            var transactionData = {
              userID: userclass.studentID,
              transactionType: 'Credit',
              transactionIdentifier: 'walletCashRefunded',
              transactionDescription: 'Wallet cash refunded for failed class booking',
              transactionAmount: parseFloat(userclass.amount.withdrawBalance + userclass.amount.promoBalance),
              classRefrence: userclass._id,
              status: 'completed'
            }

            Transaction.create(transactionData, function(err, transaction){
              var _notificationData = {
                forUser: userclass.studentID,
                fromUser: userclass.teacherID,
                notificationType: 'requestDenied',
                notificationStatus: 'unread',
                notificationMessage: 'Test Message',
                referenceClass: userclass._id
              }
              Notification.create(_notificationData, function(err, notification){
                console.log(err);
                eventEmitter.emit('notifyClassDenied', {
                  classId: classId
                });
                return res.status(201).json(userclass);
              });
            })
          });
        });
      });
    }else{
      return res.status(400).send("Invalid request type");
    }
  });
};

// Updates an existing userclass in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Userclass.findById(req.params.id, function (err, userclass) {
    if (err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    var updated = _.merge(userclass, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(userclass);
    });
  });
};

// Deletes a userclass from the DB.
exports.destroy = function(req, res) {
  Userclass.findById(req.params.id, function (err, userclass) {
    if(err) { return handleError(res, err); }
    if(!userclass) { return res.status(404).send('Not Found'); }
    userclass.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

function processEndClass(classId){
  
}

function bindEvents(){
  eventEmitter.on('scheduleEndClass', function(data){
    schedule.scheduleJob(parseInt(data.time), function(classId){
      eventEmitter.emit('endClass', {
        classId: classId
      });
      processEndClass(classId);
    }.bind(null,data.data.classId));
  });

  eventEmitter.on('schedulePriorClassNotification', function(data){
    schedule.scheduleJob(parseInt(data.time), function(classId){
      eventEmitter.emit('notifyUser', {
        classId: classId
      });
    }.bind(null,data.data.classId));
  });
}