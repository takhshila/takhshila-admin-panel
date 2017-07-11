'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CountriesSchema = new Schema({
  name: {type: String, required: true, dropDups: true, lowercase: true, trim: true},
  code: {type: String},
  dialCode: {type: Number},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Countries', CountriesSchema);