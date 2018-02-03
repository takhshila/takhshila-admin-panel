'use strict';

var _ = require('lodash');
var ClassDetails = require('./classDetails.model');

// Get list of classDetailss
exports.index = function(req, res) {
  ClassDetails.find(function (err, classDetailss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(classDetailss);
  });
};

// Get a single classDetails
exports.show = function(req, res) {
  ClassDetails.findById(req.params.id, function (err, classDetails) {
    if(err) { return handleError(res, err); }
    if(!classDetails) { return res.status(404).send('Not Found'); }
    return res.json(classDetails);
  });
};

// Creates a new classDetails in the DB.
exports.create = function(req, res) {
  ClassDetails.create(req.body, function(err, classDetails) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(classDetails);
  });
};

// Updates an existing classDetails in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  ClassDetails.findById(req.params.id, function (err, classDetails) {
    if (err) { return handleError(res, err); }
    if(!classDetails) { return res.status(404).send('Not Found'); }
    var updated = _.merge(classDetails, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(classDetails);
    });
  });
};

// Deletes a classDetails from the DB.
exports.destroy = function(req, res) {
  ClassDetails.findById(req.params.id, function (err, classDetails) {
    if(err) { return handleError(res, err); }
    if(!classDetails) { return res.status(404).send('Not Found'); }
    classDetails.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}