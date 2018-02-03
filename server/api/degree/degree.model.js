'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DegreeSchema = new Schema({
  degreeName: {type: String, required : true, dropDups: true, trim: true},
  addedByID: {type: String, ref: 'User', required: true},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

DegreeSchema
  .pre('save', function(next) {
    // if (!this.isNew) return next();
    this.degreeName = capitalize(this.degreeName);
    return next();
  });


function capitalize(str) {
  	if(str){
		str = str.toLowerCase().split(' ');
		for (var i = 0; i < str.length; i++) {
			if(str[i] !== 'of'){
				str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
			}
		}
		return str.join(' ');
  	}
}

module.exports = mongoose.model('Degree', DegreeSchema);