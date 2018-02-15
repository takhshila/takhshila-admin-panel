'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: {type: String, default: 'Untitled'},
  description: {type: String, default: ''},
  videoAsset: {
    mpeg: [{
      bitrate: {type: Number, default: null},
      fileSize: {type: Number, default: null},
      duration: {type: Number, default: null},
      url: {type: String, default: null},
    }]
  },
  imageAssets: [{
    url: {type: String, default: null},
  }],
  transcodeTime: {type: Number, default: null},
  thumbnail: {type: String, default: null},
  topics: [{type: String, ref: 'Topic'}],
  userId: {type: String, ref: 'User', required: true},
  status: {type: String, required: true, default: 'processing'},
  active: {type: Boolean, default: false},
  uploadedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Video', VideoSchema);