'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TopicSchema = new Schema({
  topicName: {type: String, unique : true, required : true, dropDups: true},
  subjectName: {type: String},
  addedByID: {type: String, ref: 'User', required: true},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Topic', TopicSchema);