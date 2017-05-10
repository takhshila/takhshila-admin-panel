'use strict';

var _ = require('lodash');
var Search = require('./search.model');
var User = require('../user/user.model');

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
      // var selectedUsers = users.map(function(user, index){
      //   return new Promise(function(resolve, reject){

      //   })
      // })
      users.map(function(user, index){
        var found = _.find(user.specialization, function(obj){
          if(obj.topic.topicName.toLowerCase() === req.query.topic.toLowerCase() && (levelMap.indexOf(obj.level.toLowerCase()) >= levelMap.indexOf(req.query.level.toLowerCase()))){
            return true;
          }
        });
        if(found){
          selectedUsers.push(user);
        }
      })
    }
    return res.status(200).json(selectedUsers);
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