'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DegreeSchema = new Schema({
  degreeName: {type: String, required : true, dropDups: true, lowercase: true, trim: true},
  addedByID: {type: String, ref: 'User', required: true},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Degree', DegreeSchema);