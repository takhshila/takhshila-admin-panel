'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: {type: String, default: 'Untitled'},
  description: {type: String, default: ''},
  videoFile: {type: String, required: true},
  videoURI: {type: String, default: null},
  thumbnailFile: {type: String, required: true},
  thumbnailURI: {type: String, default: null},
  topics: [{type: String, ref: 'Topic'}],
  userId: {type: String, ref: 'User', required: true},
  status: {type: String, required: true, default: 'pending'},
  active: {type: Boolean, default: false},
  uploadedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Video', VideoSchema);