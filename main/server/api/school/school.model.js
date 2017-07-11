'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchoolSchema = new Schema({
  schoolName: {type: String, required : true, dropDups: true, lowercase: true, trim: true},
  countryCode: {type: String, default: null},
  countryName: {type: String, default: null},
  state: {type: String, default: null},
  addedByID: {type: String, ref: 'User', default: null},
  website: {type: String, default: null},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('School', SchoolSchema);