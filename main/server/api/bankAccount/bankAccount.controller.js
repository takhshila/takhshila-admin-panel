'use strict';

var _ = require('lodash');
var BankAccount = require('./bankAccount.model');
var Bank = require('../bank/bank.model');

// Get list of bankAccounts
exports.getBankAccounts = function(req, res) {
  var userId = req.user._id;
  BankAccount.find({
    userID: userId
  })
  .sort({
    dateTime: 'desc'
  })
  .populate('userID', 'name')
  .exec(function (err, bankAccounts) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(bankAccounts);
  });
};

// Get a single bankAccount
exports.show = function(req, res) {
  BankAccount.findById(req.params.id, function (err, bankAccount) {
    if(err) { return handleError(res, err); }
    if(!bankAccount) { return res.status(404).send('Not Found'); }
    return res.json(bankAccount);
  });
};

// Creates a new bankAccount in the DB.
exports.addBankAccount = function(req, res) {
  var addBankAccountPromise = new Promise(function(resolve, reject){
    var userID = req.user._id;
    var bankAccountData = {
      userID: userID,
      name: req.body.name,
      accountNumber: req.body.accountNumber,
      bankName: req.body.bankName,
      branchName: req.body.branchName,
      ifscCode: req.body.bankDetails.IFSC
    }
    console.log(bankAccountData);
    Bank.findOne({
      ifsc: req.body.bankDetails.IFSC
    })
    .exec(function(err, bank){
      if(!bank){
        var bankData = {
          bank: req.body.bankDetails.BANK,
          ifsc: req.body.bankDetails.IFSC,
          branch: req.body.bankDetails.BRANCH,
          address: req.body.bankDetails.ADDRESS,
          state: req.body.bankDetails.STATE,
          district: req.body.bankDetails.DISTRICT,
          city: req.body.bankDetails.CITY,
          mirCode: req.body.bankDetails.MICRCODE,
          contact: req.body.bankDetails.CONTACT,
        }
        Bank.create(bankData, function(err, newBank){
          bankAccountData.bankID = newBank._id.toString();
          BankAccount.create(bankAccountData, function(err, bankAccount) {
            if(err) { reject(err); }
            resolve(bankAccount);
          });
        });
      }else{
        bankAccountData.bankID = bank._id.toString();
        BankAccount.create(bankAccountData, function(err, bankAccount) {
          if(err) { reject(err); }
          resolve(bankAccount);
        });
      }
    });
  });

  addBankAccountPromise
  .then(function(bankAccount){
    return res.status(201).json(bankAccount);
  })
  .catch(function(err){
    console.log(err);
    return handleError(res, err);
  })
};

// Updates an existing bankAccount in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BankAccount.findById(req.params.id, function (err, bankAccount) {
    if (err) { return handleError(res, err); }
    if(!bankAccount) { return res.status(404).send('Not Found'); }
    var updated = _.merge(bankAccount, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(bankAccount);
    });
  });
};

// Deletes a bankAccount from the DB.
exports.destroy = function(req, res) {
  BankAccount.findById(req.params.id, function (err, bankAccount) {
    if(err) { return handleError(res, err); }
    if(!bankAccount) { return res.status(404).send('Not Found'); }
    bankAccount.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}