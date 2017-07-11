'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CountriesSchema = new Schema({
  name: {type: String, required: true, dropDups: true, lowercase: true, trim: true},
  dial_code: {type: Number},
  code: {type: String},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Countries', CountriesSchema);