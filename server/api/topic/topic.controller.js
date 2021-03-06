'use strict';

var _ = require('lodash');
var Topic = require('./topic.model');
var User = require('../user/user.model');

// Get list of topics
exports.index = function(req, res) {
  var perPage = req.query.perPage || 10;
  var page = req.query.page || 0;
  Topic
  .find({})
  .limit(parseInt(perPage))
  .skip(perPage * page)
  .populate('addedByID')
  .sort({
    addedOn: 'desc'
  })
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
// Search topic
exports.search = function(req, res) {
  Topic.find({
    topicName: new RegExp(req.params.searchTerm, "i"),
    active: true
  }, function (err, topic) {
    if(err) { return handleError(res, err); }
    if(!topic) { return res.status(404).send('Not Found'); }
    return res.json(topic);
  });
};

// Creates a new topic in the DB.
exports.create = function(req, res) {
  var userID = req.user._id;
  var topicName = req.body.topicName;
  var addTopicPromise = new Promise(function(resolve, reject){
    Topic.findOne({
      topicName: capitalize(topicName.toLowerCase()),
      active: true
    }, function(err, topic){
      if(err){ reject(err); }
      if(!topic){
        var newTopic = {
          topicName: topicName,
          addedByID: userID
        }
        Topic.create(newTopic, function(err, addedTopic){
          if(err){ reject(err); }
          resolve(addedTopic);
        });
      }else{
        resolve(topic);
      }
    })
  })

  addTopicPromise
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

function capitalize(str) {
    if(str){
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      if(str[i] !== 'of'){
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
      }
    }
    return str.join(' ');
    }
}