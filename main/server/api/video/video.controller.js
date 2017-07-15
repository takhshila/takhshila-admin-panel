'use strict';

var _ = require('lodash');
var mv = require('mv');
var ffmpeg = require('fluent-ffmpeg');
var Video = require('./video.model');

// Get list of videos
exports.index = function(req, res) {
  Video.find(function (err, videos) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(videos);
  });
};

// Get a single video
exports.show = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    return res.json(video);
  });
};
// Get list of user videos
exports.userVideo = function(req, res) {
  Video
  .find({ userId: req.params.id })
  .populate('topics')
  .exec(function (err, videos) {
    if(err) { return handleError(res, err); }
      return res.status(200).json(videos);
  });
};

// Creates a new video in the DB.
exports.create = function(req, res) {
  var currentTimestamp = new Date().getTime();
  var files = req.files;
  var videoSource = files.file[0].path;
  var fileExtension = files.file[0].originalFilename.split('.').pop().toLowerCase();
  var newFileName = req.user._id + currentTimestamp;
  var thumbDestination = 'uploads/thumbnails/';
  var videoDestination = 'uploads/videos/';
  var promise = new Promise(function(resolve, reject){
    mv(videoSource, videoDestination+newFileName+'.'+fileExtension, function(err) {
      if (err) { return handleError(res, err); }
      ffmpeg(videoDestination+newFileName+'.'+fileExtension)
      .takeScreenshots({
        count: 1,
        filename: newFileName + '.png',
        folder: thumbDestination,
      })
      .on('start', function(cmd) {
        console.log('Started ' + cmd);
      })
      .on('end', function(res) {
        console.log('Finished encoding');
        console.log(res);
        resolve(newFileName + '.png');
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message);
        reject(err.message);
      });
    });
  });
  promise.then(function(data){
    var videoEntry = {
      videoFile: newFileName+'.'+fileExtension,
      thumbnailFile: newFileName + '.png',
      userId: req.user._id
    }
    Video.create(videoEntry, function(err, video){
      if (err) { return handleError(res, err); }
      return res.status(201).json({success: true, video: video});
    });
  })
  // return res.status(201).json({success: true});
};

// Updates an existing video in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.body.userId) { delete req.body.userId; }
  // if(req.body.videoFile) { delete req.body.videoFile; }
  // if(req.body.thumbnailFile) { delete req.body.thumbnailFile; }

  var userId = req.user._id;

  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    if(video.userId.toString() !== userId.toString()){ return res.status(403).send('You are not authorized to update this video'); }
    var videoData = {}
    if(req.body.title){
      videoData.title = req.body.title;
    }
    if(req.body.description){
      videoData.description = req.body.description;
    }
    if(req.body.topics && req.body.topics.length > 0){
      video.topics = [];
      for(var i = 0; i < req.body.topics.length; i++){
        if(typeof req.body.topics[i].toLowerCase() === "string"){
          video.topics.push(req.body.topics[i]);
        }
      }
    }

    var updated = _.merge(video, videoData);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(updated);
    });
  });
};

// Deletes a video from the DB.
exports.destroy = function(req, res) {
  var userId = req.user._id;
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    if(video.userId.toString() !== userId.toString()){ return res.status(403).send('You are not authorized to delete this video'); }
    video.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
