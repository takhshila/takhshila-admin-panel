'use strict';

var _ = require('lodash');
var Wallet = require('./wallet.model');

// Get list of wallets
exports.index = function(req, res) {
  var perPage = req.query.perPage || 10;
  var page = req.query.page || 0;

  Wallet
  .find()
  .populate('userID withdrawlRefrence')
  .limit(perPage)
  .skip(perPage * page)
  .sort({
    totalBalance: 'desc'
  })
  .exec(function (err, wallets) {
    if(err) { return handleError(res, err); }
    var walletList = [];
    for(var i = 0; i < wallets.length; i++){
      if(wallets[i].userID !== null){
        walletList.push(wallets[i]);
      }
    }
    return res.status(200).json(walletList);
  });
};

// Get current user wallet
exports.getBalance = function(req, res) {
  var userID = req.user.id;
  console.log(userID);
  Wallet.findOne({
    userID: userID
  }, function (err, wallet) {
    if(err) { return handleError(res, err); }
    if(!wallet) { return res.status(404).send('Not Found'); }
    return res.json(wallet);
  });
};

// Get a single wallet
exports.show = function(req, res) {
  Wallet.findById(req.params.id, function (err, wallet) {
    if(err) { return handleError(res, err); }
    if(!wallet) { return res.status(404).send('Not Found'); }
    return res.json(wallet);
  });
};

// Creates a new wallet in the DB.
exports.create = function(req, res) {
  Wallet.create(req.body, function(err, wallet) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(wallet);
  });
};

// Updates an existing wallet in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Wallet.findById(req.params.id, function (err, wallet) {
    if (err) { return handleError(res, err); }
    if(!wallet) { return res.status(404).send('Not Found'); }
    var updated = _.merge(wallet, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(wallet);
    });
  });
};

// Deletes a wallet from the DB.
exports.destroy = function(req, res) {
  Wallet.findById(req.params.id, function (err, wallet) {
    if(err) { return handleError(res, err); }
    if(!wallet) { return res.status(404).send('Not Found'); }
    wallet.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}