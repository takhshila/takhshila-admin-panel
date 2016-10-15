'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: {type: String, required: true},
  videoFile: {type: String, required: true},
  videoURI: {type: String, required: true},
  thumbnalFile: {type: String, required: true},
  thumbnailURI: {type: String, required: true},
  topics: {},
  userId: {type: String, required: true},
  active: Boolean
});

module.exports = mongoose.model('Video', VideoSchema);