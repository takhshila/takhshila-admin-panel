'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LanguageSchema = new Schema({
  code: {type: String, required : true, dropDups: true, lowercase: true, trim: true},
  name: {type: String, lowercase: true, trim: true},
  nativeName: {type: String, lowercase: true, trim: true},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Language', LanguageSchema);