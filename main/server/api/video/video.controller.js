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
  mv(videoSource, videoDestination+newFileName+'.'+fileExtension, function(err) {
    if (err) { return handleError(res, err); }
    ffmpeg(videoDestination+newFileName+'.'+fileExtension)
    .takeScreenshots({
      count: 1,
      filename: newFileName + '.png',
      folder: thumbDestination,
    });
    var videoEntry = {
      videoFile: newFileName+'.'+fileExtension,
      thumbnailFile: newFileName + '.png',
      userId: req.user._id
    }
    Video.create(videoEntry, function(err, video){
      if (err) { return handleError(res, err); }
      return res.status(201).json({success: true, video: video});
    });
  });
  // return res.status(201).json({success: true});
};

// Updates an existing video in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.body.userId) { delete req.body.userId; }
  if(req.body.videoFile) { delete req.body.videoFile; }
  if(req.body.thumbnailFile) { delete req.body.thumbnailFile; }

  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    var updated = _.merge(video, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(video);
    });
  });
};

// Deletes a video from the DB.
exports.destroy = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    video.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
