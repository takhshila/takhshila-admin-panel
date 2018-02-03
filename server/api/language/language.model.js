'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LanguageSchema = new Schema({
  code: {type: String, required : true, dropDups: true, trim: true},
  name: {type: String, lowercase: true, trim: true},
  nativeName: {type: String, lowercase: true, trim: true},
  active: {type: Boolean, default: true}
});


LanguageSchema
  .pre('save', function(next) {
    // if (!this.isNew) return next();
    this.name = capitalize(this.name);
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

module.exports = mongoose.model('Language', LanguageSchema);