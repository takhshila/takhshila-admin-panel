'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchoolSchema = new Schema({
  schoolName: {type: String, required : true, dropDups: true, lowercase: true, trim: true},
  countryCode: {type: String},
  state: {type: String},
  addedByID: {type: String, ref: 'User', required: true},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('School', SchoolSchema);