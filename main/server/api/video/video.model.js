'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: {type: String, default: 'Untitled'},
  videoFile: {type: String, required: true},
  videoURI: {type: String, default: null},
  thumbnailFile: {type: String, required: true},
  thumbnailURI: {type: String, default: null},
  topics: [{type: String, ref: 'Topic'}],
  userId: {type: String, required: true},
  active: {type: Boolean, default: false}
});

module.exports = mongoose.model('Video', VideoSchema);