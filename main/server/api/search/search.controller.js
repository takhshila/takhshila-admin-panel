'use strict';

var _ = require('lodash');
var Search = require('./search.model');
var User = require('../user/user.model');
var Video = require('../video/video.model');
var Review = require('../review/review.model');

// Get list of searchs
exports.searchTeacher = function(req, res) {
  var levelMap = ['basic', 'intermediate', 'advanced', 'expert', 'others'];
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
            if(obj.topic.topicName.toLowerCase() === req.query.topic.toLowerCase()){
              var queryLevel = req.query.level.toLowerCase().split(',');
              for(var i = 0; i < obj.level.length; i++){
                if(queryLevel.indexOf(obj.level[i].toLowerCase()) !== -1){
                  return true;
                }
              }
            }
          });
          var minPriceConditionFulfilled = true;
          var maxPriceConditionFulfilled = true;
          if(req.query.maxPrice){
            if(user.ratePerHour.value > req.query.maxPrice){
              maxPriceConditionFulfilled = false;
            }
          }
          if(req.query.minPrice){
            if(user.ratePerHour.value < req.query.minPrice){
              minPriceConditionFulfilled = false;
            }
          }
          if(found && user.ratePerHour.value && minPriceConditionFulfilled && maxPriceConditionFulfilled){
            var userData = {
              userDetails: user,
              videos: [],
              reviews: []
            }
            getUserVideos(user._id)
            .then(function(response){
              userData.videos = response;
              getUserReviews(user._id)
              .then(function(response){
                userData.reviews = response;
                selectedUsers.push(userData);
                resolve(selectedUsers);
              })
              .catch(function(err){
                selectedUsers.push(userData);
                resolve(selectedUsers);
              })
            })
            .catch(function(err){
              getUserReviews(user._id)
              .then(function(response){
                userData.reviews = response;
                selectedUsers.push(userData);
                resolve(selectedUsers);
              })
              .catch(function(err){
                selectedUsers.push(userData);
                resolve(selectedUsers);
              })
            })
          }
        })
      })
    }

    Promise.all(promiseList)
    .then(function(data){
      console.log(selectedUsers[0].videos);
      for(var i = 0; i < selectedUsers.length; i++){
        var totalRating = 0;
        for(var j = 0; j < selectedUsers[i].reviews.length; j++){
          totalRating += selectedUsers[i].reviews[j].rating;
        }
        var averageRating = (totalRating/selectedUsers[i].reviews.length);
        selectedUsers[0].averageRating = averageRating;
        selectedUsers[0].totalRating = selectedUsers[i].reviews.length;
      }
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

function getUserReviews(userId) {
  return new Promise(function(resolve, reject){
    Review
    .find({ refrenceUserID: userId })
    .exec(function (err, reviews) {
      if(err) { reject("No reviews found"); }
      resolve(reviews);
    });
  });
}