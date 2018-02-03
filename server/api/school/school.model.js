'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchoolSchema = new Schema({
  schoolName: {type: String, required : true, dropDups: true, trim: true},
  countryCode: {type: String, default: null},
  countryName: {type: String, default: null},
  state: {type: String, default: null},
  addedByID: {type: String, ref: 'User', default: null},
  website: {type: String, default: null},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

SchoolSchema
  .pre('save', function(next) {
    // if (!this.isNew) return next();
    this.schoolName = capitalize(this.schoolName);
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


module.exports = mongoose.model('School', SchoolSchema);