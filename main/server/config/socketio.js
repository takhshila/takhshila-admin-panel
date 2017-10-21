/**
 * Socket.io configuration
 */

'use strict';

var events = require('events');
var moment = require('moment');
var Helper = require('../common/helper')
var config = require('./environment');
var User = require('../api/user/user.model');
var Userclass = require('../api/userclass/userclass.model');
var Transaction = require('../api/transaction/transaction.model');
var Wallet = require('../api/wallet/wallet.model');
var Scheduler = require('../api/scheduler/scheduler.model');
var eventEmitter = new events.EventEmitter();

var liveClassList = [];
// var userSockets = [];
var liveClassUsers = [];
var onlineUsers = [];
var classSessions = {};
var teacherSessions = {};
var studentSessions = {};


// Pass eventEmitter to api controllers
require('../api/userclass/userclass.controller').setEvenetEmitter(eventEmitter);
require('../api/transaction/transaction.controller').setEvenetEmitter(eventEmitter);

// When the user disconnects.. perform this
function onDisconnect(socket) {
  var userID = socket.decoded_token._id;
  if(liveClassUsers[socket.decoded_token._id] !== undefined && liveClassUsers[socket.decoded_token._id].id === socket.id){
    var userClassID = liveClassUsers[userID].classID;
    
    if(liveClassList[userClassID] !== undefined){
      for(var i = 0; i < liveClassList[userClassID].connectedUser.length; i++){
        if(liveClassList[userClassID].connectedUser[i] !== userID){
          liveClassUsers[liveClassList[userClassID].connectedUser[i]].emit('userLeftClass', {});
        }
      }
      var liveClassUserIndex = liveClassList[userClassID].connectedUser.indexOf(userID);
      delete liveClassList[userClassID].connectedUser.splice(liveClassUserIndex, 1);
      if(liveClassList[userClassID].classDetails.studentID === userID){
        endStudentSession(userClassID);
      }
      if(liveClassList[userClassID].classDetails.teacherID === userID){
        endTeacherSession(userClassID);
      }
      endSession(userClassID, userID);
    }
    
    delete liveClassUsers[userID];
  }
  delete onlineUsers[userID];
}

// When the user connects.. perform this
function onConnect(socket) {
  var userID = socket.decoded_token._id;
  onlineUsers[userID] = socket;

  socket.on('joinClass', function(data,  callback){
    var output = {
          success : false
        },
        classID = data.classID,
        peerID = data.peerID,
        userID = socket.decoded_token._id;

    if(liveClassUsers[userID] === undefined){
      Userclass.findById(classID, function (err, userclass) {
        if(err || !userclass) { 
        // if(false) { 
          output.success = false;
          output.error = {
            type: 'invalid_class',
            description: "This class doesnot exists"
          };
        }else{
          liveClassUsers[userID] = socket;
          liveClassUsers[userID].classID = classID;
          liveClassUsers[userID].peerID = peerID;
          if(liveClassList[classID] === undefined){
            liveClassList[classID] = {
              classDetails: userclass,
              connectedUser: [userID],
              status: 'waiting'
            }
          }else{
            liveClassList[classID].connectedUser.push(userID);
          }
          output.success = true
          output.classDetails = userclass
        }
        callback(output);
        startLiveClass(classID);
        if(userclass.studentID === userID){
          startStudentSession(classID);
        }
        if(userclass.teacherID === userID){
          startTeacherSession(classID);
        }
      });
    }else{
      // liveClassUsers[userID].emit('alreadyLoggedIn', {});
      output.success = false;
      output.error = {
        type: 'alreaday_logged_in',
        description: "You are already logged in from a different browser or tab"
      };
      callback(output);
    }
  })

  socket.on('endClass', function(data,  callback){
    var output = {
          success : false
        },
        classID = data.classID,
        peerID = data.peerID,
        userID = socket.decoded_token._id;
    if(liveClassList[classID] !== undefined){
      if(liveClassList[classID].classDetails.studentID === userID){
        var classStartTime = liveClassList[classID].classDetails.requestedTime.start;
        var classEndTime = moment().valueOf();
        var classDuration = ((classEndTime - classStartTime)/60000);
        if(classDuration <= 15){
          endClass(classID, 'preEnded');
        }else{
          var timeSinceClassStart = parseInt(moment().valueOf() - liveClassList[classID].classDetails.requestedTime.start);
          var minimunOnlineTime = (0.8 * timeSinceClassStart);
          var teacherOnlineTime = 0;
          var studentOnlineTime = 0;
          for(var i= 0; i < teacherSessions.length; i++){
            var totalDuration = teacherSessions[i].totalDuration;
            if(totalDuration == null){
              totalDuration = moment().valueOf() - teacherSessions[i].start
            }
            teacherOnlineTime += totalDuration;
          }
          for(var i= 0; i < studentSessions.length; i++){
            var totalDuration = studentSessions[i].totalDuration;
            if(totalDuration == null){
              totalDuration = moment().valueOf() - studentSessions[i].start
            }
            studentOnlineTime += totalDuration;
          }
          if(teacherOnlineTime < minimunOnlineTime){
            console.log("Cancelling class due to tutor unavailability");
            endClass(classID, 'tutorUnavailable');
          }else{
            console.log("Ending class and marking as completed");
            endClass(classID, 'completed');
          }          
        }
        output.success = true;
      }
    }
    callback(output);
  });  
}

function startLiveClass(classID){
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].connectedUser.length === 2){
      liveClassList[classID].status = "ongoing";
      liveClassList[classID].startTime = moment().valueOf();

      for(var i = 0; i < liveClassList[classID].connectedUser.length; i++){
        liveClassUsers[liveClassList[classID].connectedUser[i]].emit('startClass', {
          'caller'    : {
            userID: liveClassList[classID].connectedUser[0],
            peerID: liveClassUsers[liveClassList[classID].connectedUser[0]].peerID
          },
          'receiver'  : {
            userID: liveClassList[classID].connectedUser[1],
            peerID: liveClassUsers[liveClassList[classID].connectedUser[1]].peerID
          }
        });
      }

      startSession(classID);
    }
  }
}

function startSession(classID){
  if(liveClassList[classID].status === "ongoing"){
    if(classSessions[classID] === undefined){
      classSessions[classID] = [];
    }
    classSessions[classID].push({
      start: moment().valueOf(),
      end: null,
      disconnectedBy: null,
      totalDuration: null
    });
  }
}

function startTeacherSession(classID){
  if(liveClassList[classID] !== undefined){
    if(moment.valueOf() >= liveClassList[classID].classDetails.requestedTime.start){
      if(teacherSessions[classID] === undefined){
        teacherSessions[classID] = [];
      }
      teacherSessions[classID].push({
        start: moment().valueOf(),
        end: null,
        totalDuration: null
      });
    }
  }
}

function startStudentSession(classID){
  if(liveClassList[classID] !== undefined){
    if(moment.valueOf() >= liveClassList[classID].classDetails.requestedTime.start){
      if(studentSessions[classID] === undefined){
        studentSessions[classID] = [];
      }
      studentSessions[classID].push({
        start: moment().valueOf(),
        end: null,
        totalDuration: null
      });
    }
  }
}

function endTeacherSession(classID){
  if(liveClassList[classID] !== undefined){
    if(moment.valueOf() <= liveClassList[classID].classDetails.requestedTime.end){
      var lastIndex = teacherSessions[classID].length - 1;
      if(teacherSessions[classID][lastIndex].end === null){
        teacherSessions[classID][lastIndex].end = moment().valueOf();
        teacherSessions[classID][lastIndex].totalDuration = teacherSessions[classID][lastIndex].end - teacherSessions[classID][lastIndex].start;
      }
    }
  }
}

function endStudentSession(classID){
  if(liveClassList[classID] !== undefined){
    if(moment.valueOf() <= liveClassList[classID].classDetails.requestedTime.end){
      var lastIndex = studentSessions[classID].length - 1;
      if(studentSessions[classID][lastIndex].end === null){
        studentSessions[classID][lastIndex].end = moment().valueOf();
        studentSessions[classID][lastIndex].totalDuration = studentSessions[classID][lastIndex].end - studentSessions[classID][lastIndex].start;
      }
    }
  }
}


function endSession(classID, userID){
  if(liveClassList[classID].status === "ongoing"){
    var lastIndex = classSessions[classID].length - 1;
    if(classSessions[classID][lastIndex].end === null){
      classSessions[classID][lastIndex].end = moment().valueOf();
      classSessions[classID][lastIndex].disconnectedBy = userID;
      classSessions[classID][lastIndex].totalDuration = classSessions[classID][lastIndex].end - classSessions[classID][lastIndex].start;
    }
  }
}

function endClass(classID, classStatus){
  if(liveClassList[classID] !== undefined){
    liveClassList[classID].status = classStatus;
    if(liveClassList[classID].connectedUser.length > 0){
      endSession(classID, null);
      endTeacherSession(classID);
      endStudentSession(classID);
      for(var i = 0; i < liveClassList[classID].connectedUser.length; i++){
        var userID = liveClassList[userClassID].connectedUser[i];
        liveClassUsers[userID].emit('endClass');
        delete liveClassUsers[userID];
      }
    }
    Userclass
    .findById(classID, function (err, userclass){
      // Transfer money from student wallet to  teacher's wallet
      // var studentID = liveClassList[classID].classDetails.studentID;
      // var teacherID = liveClassList[classID].classDetails.teacherID;
      // var totalCost = liveClassList[classID].classDetails.amount.totalCost;
      // var paidToTeacher = parseFloat(liveClassList[classID].classDetails.amount.paidToTeacher);

      var studentID = userclass.studentID;
      var teacherID = userclass.teacherID;
      var totalCost = userclass.amount.totalCost;
      var paidToTeacher = parseFloat(userclass.amount.paidToTeacher);

      var commission = parseFloat(totalCost - paidToTeacher);

      userclass.status = classStatus;
      userclass.save(function (err, updateduserclass){
        if(updateduserclass.status === 'completed'){
          var transactionDataForTeacher = {
            userID: teacherID,
            transactionType: 'Credit',
            transactionIdentifier: 'walletCashReceived',
            transactionDescription: 'Wallet cash for INR ' + paidToTeacher + ' received',
            transactionAmount: paidToTeacher,
            classRefrence: userclass._id,
            status: 'completed'
          }
          Transaction.create(transactionDataForTeacher, function(err){
            Wallet.findOne({
              userID: teacherID
            }, function(err, walletData){
              walletData.withdrawBalance = parseFloat(walletData.withdrawBalance + paidToTeacher);
              walletData.totalBalance = parseFloat(walletData.totalBalance + paidToTeacher);
              console.log("Updating wallet data");
              walletData.save(function(err){
                var transactionDataForTakhshila = {
                  transactionType: 'Credit',
                  transactionIdentifier: 'commissionReceived',
                  transactionDescription: 'Commission for INR ' + commission + ' received',
                  transactionAmount: commission,
                  classRefrence: userclass._id,
                  status: 'completed'
                }

                Transaction.create(transactionDataForTakhshila, function(err){
                  console.log('Transaction after completion of class has been completed');
                });
              });
            });
          });
        }else if(updateduserclass.status === 'preEnded' || updateduserclass.status === 'tutorUnavailable'){
          Wallet.findOne({
            userID: updateduserclass.studentID
          }, function(err, walletData){
            // var refundAmount = parseFloat(userclass.amount.withdrawBalance);
            walletData.nonWithdrawBalance = parseFloat(walletData.nonWithdrawBalance - (updateduserclass.amount.withdrawBalance + updateduserclass.amount.promoBalance));
            walletData.withdrawBalance = parseFloat(walletData.withdrawBalance + updateduserclass.amount.withdrawBalance);
            walletData.promoBalance = parseFloat(walletData.promoBalance + updateduserclass.amount.promoBalance);
            walletData.totalBalance = parseFloat(walletData.totalBalance + (updateduserclass.amount.withdrawBalance + updateduserclass.amount.promoBalance));

            var transactionDescription = '';
            if(updateduserclass.status === 'preEnded'){
              transactionDescription = "Wallet cash refunded because you ended the class within 15 mins of class start.";
            }
            if(updateduserclass.status === 'tutorUnavailable'){
              transactionDescription = "Wallet cash refunded because class was cancelled due to unavailability of tutor.";
            }
            walletData.save(function(err){
              var transactionData = {
                userID: updateduserclass.studentID,
                transactionType: 'Credit',
                transactionIdentifier: 'walletCashRefunded',
                transactionDescription: transactionDescription,
                transactionAmount: parseFloat(updateduserclass.amount.withdrawBalance + updateduserclass.amount.promoBalance),
                classRefrence: updateduserclass._id,
                status: 'completed'
              }

              Transaction.create(transactionData, function(err, transaction){
                console.log('Transaction after cancellation of class');
              })
            });
          });
        }
        delete liveClassList[classID];
      });
    });
  }

}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:

  socketio.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.handshake.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.handshake.address);
  });
};


eventEmitter.on('paymentInitialised', function(data){
  console.log('Captured Event');
  console.log(data);
});

eventEmitter.on('notifyUser', function(data){
  console.log('Received event: Notifying user');
  var classID = data.classId;
  var classLink = 'http://localhost:9000/liveclass/' + classID;
  Userclass
  .findById(classID)
  .populate('studentID teacherID')
  .exec(function (err, userclass){
    var users = {
      student: userclass.studentID,
      teacher: userclass.teacherID
    };
    if(liveClassList[classID] === undefined){
      liveClassList[classID] = {
        classDetails: null,
        connectedUser: []
      }
    }
    for(var userType in users){
      var user = users[userType];
      console.log("user._id.toString()");
      console.log(user._id.toString());
      console.log("onlineUsers");
      console.log(onlineUsers);
      if(onlineUsers[user._id.toString()] === undefined){
        var textMessage = 'Hi ' + user.name.firstName + '! Your takhshila class is about to start. Please visit ' + classLink;
        Helper.sendTextMessage(user.phone, textMessage);
      }else{
        onlineUsers[user._id.toString()].emit('liveClassLink', {
          classLink: classLink,
          classID: classID
        });
      }
    }
  })
});

eventEmitter.on('endClass', function(data){
  console.log('Received event: End class');
  var classID = data.classId;
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].status !== 'completed' && liveClassList[classID].status !== 'preEnded'){
      var timeSinceClassStart = parseInt(moment().valueOf() - liveClassList[classID].classDetails.requestedTime.start);
      var minimunOnlineTime = (0.8 * timeSinceClassStart);
      var teacherOnlineTime = 0;
      var studentOnlineTime = 0;
      for(var i= 0; i < teacherSessions.length; i++){
        var totalDuration = teacherSessions[i].totalDuration;
        if(totalDuration == null){
          totalDuration = moment().valueOf() - teacherSessions[i].start
        }
        teacherOnlineTime += totalDuration;
      }
      for(var i= 0; i < studentSessions.length; i++){
        var totalDuration = studentSessions[i].totalDuration;
        if(totalDuration == null){
          totalDuration = moment().valueOf() - studentSessions[i].start
        }
        studentOnlineTime += totalDuration;
      }
      if(teacherOnlineTime < minimunOnlineTime){
        console.log("Cancelling class due to tutor unavailability");
        endClass(classID, 'tutorUnavailable');
      }else{
        console.log("Ending class and marking as completed");
        endClass(classID, 'completed');
      }  
    }
  }
  // endClass(classID, null);
})

eventEmitter.on('checkClassStart', function(data){
  console.log('Received event: Check If Class Started');
  var classID = data.classId;
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].status === 'waiting'){
      var timeSinceClassStart = parseInt(moment().valueOf() - liveClassList[classID].classDetails.requestedTime.start);
      var minimunOnlineTime = (0.8 * timeSinceClassStart);
      var teacherOnlineTime = 0;
      var studentOnlineTime = 0;
      for(var i= 0; i < teacherSessions.length; i++){
        var totalDuration = teacherSessions[i].totalDuration;
        if(totalDuration == null){
          totalDuration = moment().valueOf() - teacherSessions[i].start
        }
        teacherOnlineTime += totalDuration;
      }
      for(var i= 0; i < studentSessions.length; i++){
        var totalDuration = studentSessions[i].totalDuration;
        if(totalDuration == null){
          totalDuration = moment().valueOf() - studentSessions[i].start
        }
        studentOnlineTime += totalDuration;
      }
      if(teacherOnlineTime < minimunOnlineTime){
        console.log("Cancelling class due to tutor unavailability");
        endClass(classID, 'tutorUnavailable');
        return;
      }
    }
  }
})

function reInitializeScheduler(){
  console.log("reInitializeScheduler called");
  var _currentTime = moment().valueOf();
  Scheduler
  .find({
    jobTime: {$gte: _currentTime}
  })
  .exec(function (err, schedulers) {
    for(var i = 0; i < schedulers.length; i++){
      var eventName = schedulers[i].jobName;
      var eventData = {
        time: schedulers[i].jobTime,
        data: JSON.parse(schedulers[i].jobData)
      }
      console.log("eventData");
      console.log(eventData);
      eventEmitter.emit(eventName, eventData);
    }
  });
}

reInitializeScheduler();