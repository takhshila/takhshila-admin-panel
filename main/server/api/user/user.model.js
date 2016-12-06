'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  email: { type: String, lowercase: true, required: true },
  isTeacher: { type: Boolean, default: false },
  profileSetup: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  profilePhoto: {
    fileName: { type: String, default: null },
    filePath: { type: String, default: null },
    fileURI: { type: String, default: null },
    dataURI: { type: String, default: null }
  },
  ratePerHour: {
    value: Number,
    currency: { type: String, default: 'INR'}
  },
  basicInfo: String,
  status: String,
  education: [{
    degree: {type: String, required: true},
    school: {type: String, required: true},
    field: String,
    start: Date,
    end: Date
  }],
  experience: [{
    company: {type: String, required: true},
    designation: {type: String, required: true},
    start: Date,
    end: Date
  }],
  availability: {
    sunday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    monday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    tuesday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    wednessday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    thursday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    friday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }],
    saturday: [{
      startHour: {type: Number, required: true},
      startMinute: {type: Number, required: true},
      endHour: {type: Number, required: true},
      endMinute: {type: Number, required: true}
    }]
  },
  hashedPassword: { type:String, required: true },
  provider: { type:String, required: true },
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role,
      'isTeacher' : this.isTeacher
    };
  });

// Teacher profile information
UserSchema
  .virtual('teacherProfile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role,
      'isTeacher' : this.isTeacher,
      'profilePhoto': this.profilePhoto,
      'ratePerHour': this.ratePerHour,
      'basicInfo': this.basicInfo,
      'education': this.education,
      'experience': this.experience,
      'availability': this.availability
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role,
      'isTeacher' : this.isTeacher
    };
  });

/**
 * Validations
 */

// Validate empty email
// UserSchema
//   .path('email')
//   .validate(function(email) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return email.length;
//   }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
