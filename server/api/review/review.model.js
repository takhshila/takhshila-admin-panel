'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReviewSchema = new Schema({
  userID: {type: String, ref: 'User', required: true},
  refrenceUserID: {type: String, ref: 'User', required: true},
  refrenceClassID: {type: String, ref: 'Userclass', required: true},
  rating: {type: String, required: true},
  review: {type: String, default: null},
  ratedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Review', ReviewSchema);