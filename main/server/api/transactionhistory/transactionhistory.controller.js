'use strict';

var _ = require('lodash');
var Transactionhistory = require('./transactionhistory.model');
var Userclass = require('../userclass/userclass.model');
var Wallet = require('../wallet/wallet.model');

// Get list of transactionhistorys
exports.index = function(req, res) {
  var userID = req.user.id;
  Transactionhistory.find({
    userID: userID
  })
  .populate('userID')
  .exec(function (err, transactionhistorys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(transactionhistorys);
  });
};

// Get a single transactionhistory
exports.show = function(req, res) {
  Transactionhistory.findById(req.params.id, function (err, transactionhistory) {
    if(err) { return handleError(res, err); }
    if(!transactionhistory) { return res.status(404).send('Not Found'); }
    return res.json(transactionhistory);
  });
};

// Creates a new transactionhistory in the DB.
exports.create = function(req, res) {
  Transactionhistory.create(req.body, function(err, transactionhistory) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(transactionhistory);
  });
};

// Updates an existing transactionhistory in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Transactionhistory.findById(req.params.id, function (err, transactionhistory) {
    if (err) { return handleError(res, err); }
    if(!transactionhistory) { return res.status(404).send('Not Found'); }
    var updated = _.merge(transactionhistory, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(transactionhistory);
    });
  });
};

// Deletes a transactionhistory from the DB.
exports.destroy = function(req, res) {
  Transactionhistory.findById(req.params.id, function (err, transactionhistory) {
    if(err) { return handleError(res, err); }
    if(!transactionhistory) { return res.status(404).send('Not Found'); }
    transactionhistory.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};



exports.processTransaction = function(userId, transactionAmount, transactionType, transactionAmountType, transactionDescription, refrenceTransaction){
  if(userId === null){
    var transactionData = {
      transactionType: transactionType,
      transactionAmount: parseFloat(transactionAmount),
      transactionAmountType: transactionAmountType,
      previousBalance: 0.00,
      newBalance: 0.00
    }
    Transactionhistory.create(transactionData, function(err, transactionHistoryData){
      if(err){ console.log(err); reject('Invalid transaction data'); return; }
      return;
    });
  } else {
    return new Promise(function(resolve, reject){
      if(!userId || !transactionAmount || !transactionType || !transactionAmountType){
        console.log(userId);
        console.log(transactionAmount);
        console.log(transactionType);
        console.log(transactionAmountType);
        reject('Invalid data');
        return;
      }

      Wallet.findOne({
        userID: userId
      }, function(err, walletData){
        if(err){ reject('Invalid user'); return; }
        var previousWalletBalance = walletData.totalBalance;
        if(transactionType.toLowerCase() === 'credit'){
          walletData[transactionAmountType] += parseFloat(transactionAmount);
          walletData.totalBalance += parseFloat(transactionAmount);
        } else if(transactionType.toLowerCase() === 'debit'){
          if(parseFloat(walletData[transactionAmountType]) < parseFloat(transactionAmount)){
            reject('Invalid transaction'); return;
          }
          walletData[transactionAmountType] -= parseFloat(transactionAmount);
          walletData.totalBalance -= parseFloat(transactionAmount);
        } else{
          reject('Invalid transaction type'); return;
        }
        
        walletData.save(function(err, updatedWalletData){
          if(err){ reject('Invalid wallet data'); return; }
          var transactionData = {
            userID: userId,
            transactionType: transactionType,
            transactionAmount: parseFloat(transactionAmount),
            transactionAmountType: transactionAmountType,
            previousBalance: previousWalletBalance,
            newBalance: updatedWalletData.totalBalance
          }
          if(transactionDescription){ transactionData.transactionDescription = transactionDescription; }
          if(refrenceTransaction){ transactionData.refrenceTransaction = refrenceTransaction; }

          Transactionhistory.create(transactionData, function(err, transactionHistoryData){
            if(err){ console.log(err); reject('Invalid transaction data'); return; }
            resolve({
              transactionHistoryData: transactionHistoryData,
              walletData: updatedWalletData
            });
          });
        });
      })
    });
  }
}

function handleError(res, err) {
  return res.status(500).send(err);
}