'use strict';

var _ = require('lodash');
var mv = require('mv');
var ffmpeg = require('fluent-ffmpeg');
var Video = require('./video.model');
var Notification = require('../notification/notification.model');

// Get list of videos
exports.index = function(req, res) {
  var perPage = req.query.perPage || 10;
  var page = req.query.page || 0;
  var filterObj = {};
  if(req.params.status){
    filterObj.status = req.params.status
  }
  Video
  .find(filterObj)
  .limit(perPage)
  .skip(perPage * page)
  .populate('userId')
  .sort({
    uploadedOn: 'desc'
  })
  .exec(function (err, videos) {
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
  .find({ 
    userId: req.params.id,
    active: true
  })
  .populate('topics userId')
  .exec(function (err, videos) {
    if(err) { return handleError(res, err); }
      return res.status(200).json(videos);
  });
};

// Get list of user videos
exports.selfVideo = function(req, res) {
  Video
  .find({ 
    userId: req.user._id
  })
  .populate('topics userId')
  .exec(function (err, videos) {
    if(err) { return handleError(res, err); }
      return res.status(200).json(videos);
  });
};

exports.create = function(req, res) {
  var videoId = null;
  var userId = req.user._id;
  var currentTimestamp = new Date().getTime();
  var files = req.files;
  var videoSource = files.file[0].path;
  var fileExtension = files.file[0].originalFilename.split('.').pop().toLowerCase();
  var newFileName = req.user._id + currentTimestamp;

  var uploadPath = Helper.getUploadPath(userId);

  var rawAssetsDir = 'assets/raw' + '/' + uploadPath;
  var videoAssetsDir = 'assets/videos' + '/' + uploadPath;
  var imageAssetsDir = 'assets/images' + '/' + uploadPath;

  // Create directory if not exists
  if (!fs.existsSync(rawAssetsDir)){
    Helper.mkDirByPathSync(rawAssetsDir);
  }
  if (!fs.existsSync(imageAssetsDir)){
    Helper.mkDirByPathSync(imageAssetsDir);
  }
  if (!fs.existsSync(videoAssetsDir)){
    Helper.mkDirByPathSync(videoAssetsDir);
  }

  var promise = new Promise(function(resolve, reject){
    var rawVideoFilePath = rawAssetsDir + '/' + newFileName + '.' + fileExtension
    var transcodedVideoFilePath = videoAssetsDir + '/' + newFileName + '.mp4'
    mv(videoSource, rawVideoFilePath, function(err) {
      if (err) { return handleError(res, err); }
      var videoEntry = {
        userId: req.user._id
      }
      Video.create(videoEntry, function(err, video){
        if (err) { return handleError(res, err); }
        videoId = video._id;
        resolve(video);

        Helper.transcodeVideo(rawVideoFilePath, transcodedVideoFilePath)
        .then(function(response){
          var transcodedVideoData = response.videoData
          var transcodeTime = response.transcodeTime
          Helper.generateThumbnails(transcodedVideoFilePath, imageAssetsDir, newFileName, 6)
          .then(function(imageList){
            Video.findById(videoId, function (err, video) {
              video.status = 'pending'
              video.transcodeTime = transcodeTime
              video.videoAsset.mpeg.push({
                bitrate: transcodedVideoData.bit_rate,
                fileSize: response.size,
                duration: transcodedVideoData.duration,
                url: config.siteBase + '/' + transcodedVideoData.filename.split('assets/')[1],
              })
              for(var i = 0; i < imageList.length; i++){
                video.imageAssets.push({
                  url: config.siteBase + '/' + imageAssetsDir.split('assets/')[1] + '/' + imageList[i]
                })
              }
              video.thumbnail = video.imageAssets[0].url;
              video.save()
            });
          })
        })
        .catch(function(err){
          if(videoId){
            Video.findById(videoId, function (err, video) {
              video.status = 'error'
              video.save()
              // video.imageAssets
            });
          }
        })
      });
    });
  });
  promise.then(function(data){
    return res.status(201).json({success: true, video: data});
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
    if(req.body.thumbnail){
      var imageIndex = _.findIndex(video.imageAssets, function(obj){ return obj.url === req.body.thumbnail })
      if(imageIndex !== -1){
        videoData.thumbnail = req.body.thumbnail;
      }
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

// Publish an existing video in the DB.
exports.publish = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    var videoData = {
      status: 'published',
      active: true
    }
    var updated = _.merge(video, videoData);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      var _notificationData = {
        forUser: updated.userId,
        fromUser: req.body.teacherID,
        notificationType: 'videoPublished',
        notificationStatus: 'unread',
        notificationMessage: 'Your video ' + updated.title + ' has been successfully published'
      }
      Notification.create(_notificationData, function(err){
        console.log(err);
        return res.status(200).json(updated);
      });
    });
  });
};

// Unpublish an existing video in the DB.
exports.unpublish = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.status(404).send('Not Found'); }
    var videoData = {
      status: 'unpublished',
      active: false
    }
    var updated = _.merge(video, videoData);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      var _notificationData = {
        forUser: updated.userId,
        fromUser: req.body.teacherID,
        notificationType: 'videounPublished',
        notificationStatus: 'unread',
        notificationMessage: 'Your video ' + updated.title + ' was not published. Please try again with a different video.'
      }
      Notification.create(_notificationData, function(err){
        console.log(err);
        return res.status(200).json(updated);
      });
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

// Deletes a video from the DB.
exports.delete = function(req, res) {
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
