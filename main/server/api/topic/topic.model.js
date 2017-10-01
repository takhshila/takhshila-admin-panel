'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TopicSchema = new Schema({
  topicName: {type: String, required : true, dropDups: true, trim: true},
  subjectName: {type: String},
  addedByID: {type: String, ref: 'User', required: true},
  addedOn: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});

TopicSchema
  .pre('save', function(next) {
    // if (!this.isNew) return next();
    this.topicName = capitalize(this.topicName);
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

module.exports = mongoose.model('Topic', TopicSchema);