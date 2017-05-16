'use strict';

var _ = require('lodash');
var Search = require('./search.model');
var User = require('../user/user.model');
var Video = require('../video/video.model');

// Get list of searchs
exports.searchTeacher = function(req, res) {
  var levelMap = ['basic', 'intermediate', 'advanced', 'expert'];
  User
  .find({ isTeacher: true })
  .select('-hashedPassword -salt')
  .populate('specialization.topic')
  .exec(function(err, users){
    if(err) { return handleError(res, err); }
    var promiseList = [], selectedUsers = [];

    if(req.query.topic){
      var promiseList = users.map(function(user, index){
        return new Promise(function(resolve, reject){
          var found = _.find(user.specialization, function(obj){
            if(obj.topic.topicName.toLowerCase() === req.query.topic.toLowerCase() && (levelMap.indexOf(obj.level.toLowerCase()) >= levelMap.indexOf(req.query.level.toLowerCase()))){
              return true;
            }
          });
          if(found && user.ratePerHour.value){
            getUserVideos(user._id)
            .then(function(response){
              selectedUsers.push({userDetails: user, videos: response});
              resolve(selectedUsers);
            })
            .catch(function(err){
              selectedUsers.push({userDetails: user, videos: response});
              resolve(selectedUsers);
            })
          }
        })
      })
    }

    Promise.all(promiseList)
    .then(function(data){
      console.log(selectedUsers[0].videos);
      return res.status(200).json(selectedUsers);
    })
    .catch(function(err){
      return res.status(200).json(selectedUsers);
    })
  });
};

// Get a single search
exports.show = function(req, res) {
  Search.findById(req.params.id, function (err, search) {
    if(err) { return handleError(res, err); }
    if(!search) { return res.status(404).send('Not Found'); }
    return res.json(search);
  });
};

// Creates a new search in the DB.
exports.create = function(req, res) {
  Search.create(req.body, function(err, search) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(search);
  });
};

// Updates an existing search in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Search.findById(req.params.id, function (err, search) {
    if (err) { return handleError(res, err); }
    if(!search) { return res.status(404).send('Not Found'); }
    var updated = _.merge(search, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(search);
    });
  });
};

// Deletes a search from the DB.
exports.destroy = function(req, res) {
  Search.findById(req.params.id, function (err, search) {
    if(err) { return handleError(res, err); }
    if(!search) { return res.status(404).send('Not Found'); }
    search.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

function getUserVideos(userId) {
  return new Promise(function(resolve, reject){
    Video
    .find({ userId: userId })
    .exec(function (err, videos) {
      if(err) { reject("No Videos Found"); }
      resolve(videos);
    });
  });
}