'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SearchSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Search', SearchSchema);