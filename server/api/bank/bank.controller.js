'use strict';

var _ = require('lodash');
var Bank = require('./bank.model');

// Get list of banks
exports.index = function(req, res) {
  Bank.find(function (err, banks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(banks);
  });
};

// Get a single bank
exports.show = function(req, res) {
  Bank.findById(req.params.id, function (err, bank) {
    if(err) { return handleError(res, err); }
    if(!bank) { return res.status(404).send('Not Found'); }
    return res.json(bank);
  });
};

// Creates a new bank in the DB.
exports.create = function(req, res) {
  Bank.create(req.body, function(err, bank) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(bank);
  });
};

// Updates an existing bank in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Bank.findById(req.params.id, function (err, bank) {
    if (err) { return handleError(res, err); }
    if(!bank) { return res.status(404).send('Not Found'); }
    var updated = _.merge(bank, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(bank);
    });
  });
};

// Deletes a bank from the DB.
exports.destroy = function(req, res) {
  Bank.findById(req.params.id, function (err, bank) {
    if(err) { return handleError(res, err); }
    if(!bank) { return res.status(404).send('Not Found'); }
    bank.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}