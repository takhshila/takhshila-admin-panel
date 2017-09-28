'use strict';

var _ = require('lodash');
var Review = require('./review.model');
var Userclass = require('../Userclass/Userclass.model');

// Get list of reviews
exports.index = function(req, res) {
  var userID = req.user._id;
  Review.find({
    userID: userID
  })
  .exec(function(err, review){
    if(err) { return handleError(res, err); }
    if(!review) { return res.status(404).send('Not Found'); }
    return res.json(review);
  });
};

// Get a single review
exports.show = function(req, res) {
  var userID = req.params.id;
  Review.find({
    userID: userID
  })
  .exec(function(err, review){
    if(err) { return handleError(res, err); }
    if(!review) { return res.status(404).send('Not Found'); }
    return res.json(review);
  });
};

// Creates a new review in the DB.
exports.create = function(req, res) {
  var userID = req.user._id;
  var userClassID = req.params.id;
  var createReviewPromise = new Promise(function(resolve, reject){
    if(!userId || !userClassID){ reject('Not Found'); }
    User.findById(userId, function (err, user){
      if(err) { reject(err); }
      if(!user) { reject('Not Found'); }
      Userclass.findById(userClassID, function(err, userClass){
        if(err){ reject(err); }
        if(!userClass) { reject('Not Found'); }
        var ratingData = {
          userID: userID,
          refrenceClassID: userClassID,
          rating: req.body.rating,
          review: req.body.review || null
        }
        if(userID.toString() === userClass.studentID.toString()){
          ratingData.refrenceUserID = teacherID;
        }else{
          ratingData.refrenceUserID = studentID;
        }
        Review.create(ratingData, function(err, review){
          if(err){ reject(err); }
          resolve(review);
        })
      })
    });
  });

  createReviewPromise
  .then(function(response){
    return res.status(201).json(response);
  })
  .catch(function(err){
    return handleError(res, err);
  })
};

// Updates an existing review in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Review.findById(req.params.id, function (err, review) {
    if (err) { return handleError(res, err); }
    if(!review) { return res.status(404).send('Not Found'); }
    var updated = _.merge(review, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(review);
    });
  });
};

// Deletes a review from the DB.
exports.destroy = function(req, res) {
  Review.findById(req.params.id, function (err, review) {
    if(err) { return handleError(res, err); }
    if(!review) { return res.status(404).send('Not Found'); }
    review.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}