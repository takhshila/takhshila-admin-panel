'use strict';

var _ = require('lodash');
var Topic = require('./topic.model');
var User = require('../user/user.model');

// Get list of topics
exports.index = function(req, res) {
  Topic
  .find({ active: true }, '-addedByID')
  .exec(function (err, topics) {
    if(err) { return handleError(res, err); }
      return res.status(200).json(topics);
  });
};

// Get a single topic
exports.show = function(req, res) {
  Topic.findById(req.params.id, function (err, topic) {
    if(err) { return handleError(res, err); }
    if(!topic) { return res.status(404).send('Not Found'); }
    return res.json(topic);
  });
};

// Creates a new topic in the DB.
exports.create = function(req, res) {
  req.body.addedByID = req.user._id;
  Topic.create(req.body, function(err, topic) {
    if(err) { return handleError(res, err); }
    User.findById(req.user._id, function(err, user){
      if(err) { return handleError(res, err); }
      return res.status(201).json(user);
    });
  });
};

// Updates an existing topic in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Topic.findById(req.params.id, function (err, topic) {
    if (err) { return handleError(res, err); }
    if(!topic) { return res.status(404).send('Not Found'); }
    var updated = _.merge(topic, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(topic);
    });
  });
};

// Deletes a topic from the DB.
exports.destroy = function(req, res) {
  Topic.findById(req.params.id, function (err, topic) {
    if(err) { return handleError(res, err); }
    if(!topic) { return res.status(404).send('Not Found'); }
    topic.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}