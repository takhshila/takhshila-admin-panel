'use strict';

var _ = require('lodash');
var Transactionhistory = require('./transactionhistory.model');

// Get list of transactionhistorys
exports.index = function(req, res) {
  Transactionhistory.find(function (err, transactionhistorys) {
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

function handleError(res, err) {
  return res.status(500).send(err);
}