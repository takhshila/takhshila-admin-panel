'use strict';

var _ = require('lodash');
var Degree = require('./degree.model');

// Get list of degrees
exports.index = function(req, res) {
  Degree.find(function (err, degrees) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(degrees);
  });
};

// Get a single degree
exports.show = function(req, res) {
  Degree.findById(req.params.id, function (err, degree) {
    if(err) { return handleError(res, err); }
    if(!degree) { return res.status(404).send('Not Found'); }
    return res.json(degree);
  });
};

// Search for degree
exports.search = function(req, res) {
  var queryObject = {}
  
  if(req.query.degreeName === undefined){ return res.status(400).json("Invalid request"); }

  if(req.query.degreeName !== undefined){
    queryObject.degreeName = new RegExp(req.query.degreeName, "i")
  }

  Degree.find(queryObject, function(err, degreeList){
    if(err){ return handleError(res, err) }
    return res.status(200).json(degreeList);
  })
};

// Creates a new degree in the DB.
exports.create = function(req, res) {
  var userID = req.user._id;

  if(req.body._id) { delete req.body._id; }
  if(!req.body.degreeName) { return handleError(res, 'Inavlid data'); }

  req.body.addedByID = userID;

  Degree.findOne({
    degreeName: req.body.degreeName.toLowerCase()
  }, function(err, degree){
    if(err) { return handleError(res, err) }
    if(!degree){
      Degree.create(req.body, function(err, addedDegree) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(addedDegree);
      });
    }else{
      return res.status(201).json(degree);
    }
  })
};

// Updates an existing degree in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Degree.findById(req.params.id, function (err, degree) {
    if (err) { return handleError(res, err); }
    if(!degree) { return res.status(404).send('Not Found'); }
    var updated = _.merge(degree, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(degree);
    });
  });
};

// Deletes a degree from the DB.
exports.destroy = function(req, res) {
  Degree.findById(req.params.id, function (err, degree) {
    if(err) { return handleError(res, err); }
    if(!degree) { return res.status(404).send('Not Found'); }
    degree.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}