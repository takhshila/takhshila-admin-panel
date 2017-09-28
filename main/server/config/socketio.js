/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');
var Userclass = require('../api/userclass/userclass.model');
var Wallet = require('../api/wallet/wallet.model');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var liveClassList = [];
// var userSockets = [];
var liveClassUsers = [];
var onlineUsers = [];

// When the user disconnects.. perform this
function onDisconnect(socket) {
  if(liveClassUsers[socket.decoded_token._id] !== undefined && liveClassUsers[socket.decoded_token._id].id === socket.id){
    console.log("User Left Live Class");

    var userID = socket.decoded_token._id;
    var userClassID = liveClassUsers[userID].classID;
    var liveClassUserIndex = liveClassList[userClassID].connectedUser.indexOf(userID);
    
    if(liveClassList[userClassID] !== undefined){
      for(var i = 0; i < liveClassList[userClassID].connectedUser.length; i++){
        if(liveClassList[userClassID].connectedUser[i] !== userID){
          liveClassUsers[liveClassList[userClassID].connectedUser[i]].emit('userLeftClass', {});
        }
      }
    }
    
    delete liveClassUsers[userID];
    delete liveClassList[userClassID].connectedUser.splice(liveClassUserIndex, 1);
  }
}

// When the user connects.. perform this
function onConnect(socket) {
  var userID = socket.decoded_token._id;
  onlineUsers[userID] = socket;

  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/review/review.socket').register(socket);
  require('../api/bankAccount/bankAccount.socket').register(socket);
  require('../api/bank/bank.socket').register(socket);

  // require('../api/classDetails/classDetails.socket').register(socket);
  // require('../api/company/company.socket').register(socket);
  // require('../api/language/language.socket').register(socket);
  // require('../api/countries/countries.socket').register(socket);
  // require('../api/transactionhistory/transactionhistory.socket').register(socket);
  // require('../api/wallet/wallet.socket').register(socket);
  // require('../api/transaction/transaction.socket').register(socket);
  // require('../api/search/search.socket').register(socket);
  // require('../api/degree/degree.socket').register(socket);
  // require('../api/school/school.socket').register(socket);
  // require('../api/notification/notification.socket').register(socket);
  // require('../api/userclass/userclass.socket').register(socket);
  // require('../api/video/video.socket').register(socket);
  // require('../api/topic/topic.socket').register(socket);
  // require('../api/thing/thing.socket').register(socket);

  // Pass eventEmitter to api controllers
  require('../api/userclass/userclass.controller').setEvenetEmitter(eventEmitter);

  socket.on('joinClass', function(data,  callback){
    var output = {
          success : false
        },
        classID = data.classID,
        peerID = data.peerID,
        userID = socket.decoded_token._id;

    if(liveClassUsers[userID] === undefined){
      Userclass.findById(classID, function (err, userclass) {
        //if(err || !userclass) { 
        if(false) { 
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
              connectedUser: [userID]
            }
          }else{
            liveClassList[classID].connectedUser.push(userID);
          }
          output.success = true
          output.classDetails = userclass
        }
        callback(output);
        startLiveClass(classID);
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
  
}

function startLiveClass(classID){
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].connectedUser.length === 2){
      console.log("Requesting start class");
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
    }
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
      if(onlineUsers[user._id.toString()] === undefined){
        var textMessage = 'Hi ' + user.name.firstName + '! Your takhshila class is about to start. Please visit ' + classLink;
        sendTextMessage(user.phone, textMessage);
      }else{
        onlineUsers[user._id.toString()].emit('liveClassLink', {
          classLink: classLink
        });
      }
    }
  })
});

eventEmitter.on('endClass', function(data){
  console.log('Received event: End class');
  var classID = data.classId;
  if(liveClassList[classID] !== undefined){
    if(liveClassList[classID].connectedUser.length > 0){
      console.log("Requesting end class");
      for(var i = 0; i < liveClassList[classID].connectedUser.length; i++){
        liveClassUsers[liveClassList[classID].connectedUser[i]].emit('endClass');
      }

      Userclass
      .findById(classID, function (err, userclass){
        userclass.status = "completed";
        userclass.save(function (err, updateduserclass){
          // Transfer money from student wallet to  teacher's wallet
          var studentID = liveClassList[classID].classDetails.studentID;
          var teacherID = liveClassList[classID].classDetails.teacherID;
          var totalCost = liveClassList[classID].classDetails.amount.totalCost;
          var paidToTeacher = parseFloat(liveClassList[classID].classDetails.amount.paidToTeacher);
          var commission = parseFloat(totalCost - paidToTeacher);

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
        });
      });
    }
  }
})



function sendTextMessage(phone, message){
  console.log('Message sent to ' + phone);
  console.log('Message text is ' + message);
}