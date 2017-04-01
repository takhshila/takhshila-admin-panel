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
  var userID = req.user._id;
  var topicList = req.body;
  var promises = topicList.map(function(topic, index){
    return new Promise(function(resolve, reject){
      Topic.findOne({
        topicName: topic.topicName.toLowerCase(),
        active: true
      }, function(err, topic){
        if(err){ reject(err); }
        console.log(topic)
        if(!topic){
          topicList[index].addedByID = userID;
          Topic.create(topicList[index], function(err, addedTopic){
            if(err){ reject(err); }
            resolve(addedTopic);
          });
        }else{
          resolve(topic);
        }
      })
    })
  });

  Promise.all(promises)
  .then(function(data){
    return res.status(201).json(data);
  })
  .catch(function(err){
    return handleError(res, err);
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