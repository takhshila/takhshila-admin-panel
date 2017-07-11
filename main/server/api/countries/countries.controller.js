'use strict';

var _ = require('lodash');
var Countries = require('./countries.model');

// Get list of countriess
exports.index = function(req, res) {
  Countries.find(function (err, countriess) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(countriess);
  });
};

// Get a single countries
exports.show = function(req, res) {
  Countries.findById(req.params.id, function (err, countries) {
    if(err) { return handleError(res, err); }
    if(!countries) { return res.status(404).send('Not Found'); }
    return res.json(countries);
  });
};

// Creates a new countries in the DB.
exports.create = function(req, res) {
  Countries.create(req.body, function(err, countries) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(countries);
  });
};

// Updates an existing countries in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Countries.findById(req.params.id, function (err, countries) {
    if (err) { return handleError(res, err); }
    if(!countries) { return res.status(404).send('Not Found'); }
    var updated = _.merge(countries, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(countries);
    });
  });
};

// Deletes a countries from the DB.
exports.destroy = function(req, res) {
  Countries.findById(req.params.id, function (err, countries) {
    if(err) { return handleError(res, err); }
    if(!countries) { return res.status(404).send('Not Found'); }
    countries.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}