'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var config = require('../../config/environment');

var UserSchema = new Schema({
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  country: {type: String, ref: 'Countries', required: true},
  dialCode: {type: Number, required: true},
  tempPhone: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, lowercase: true },
  phoneVerificationCode: {type: Number, default: null},
  emailVerificationCode: { type: Number, default: null },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isTeacher: { type: Boolean, default: false },
  profileSetup: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  profilePhoto: {
    fileName: { type: String, default: null },
    filePath: { type: String, default: null },
    fileURI: { type: String, default: null },
    dataURI: { type: String, default: config.defaultData.profilePhoto }
  },
  ratePerHour: {
    base: Number,
    value: Number,
    currency: { type: String, default: 'INR'}
  },
  basicInfo: { type: String, default: ''},
  status: { type: String, default: 'pending'},
  specialization: [{
    topic: {type: String, ref: 'Topic', required: true},
    level: [{type: String, enum : ["Basic", "Intermediate", "Advanced", "Expert", "Others"], required: true}],
    addedOn: {type: Date, default: Date.now}
  }],
  education: [{
    degreeId: {type: String, ref: 'Degree', required: true},
    degreeName: {type: String, required: true},
    schoolId: {type: String, ref: 'School', required: true},
    schoolName: {type: String, required: true},
    field: String,
    start: Number,
    end: Number
  }],
  experience: [{
    companyId: {type: String, ref: 'Company', required: true},
    companyName: {type: String, required: true},
    designation: {type: String, required: true},
    start: Number,
    end: Number
  }],
  availability: {
    sunday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    monday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    tuesday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    wednessday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    thursday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    friday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }],
    saturday: [{
      start: {type: String, required: true},
      end: {type: String, required: true}
    }]
  },
  hashedPassword: { type:String, required: true },
  provider: { type:String, required: true },
  joinedOn: {type: Date, default: Date.now},
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
      'isTeacher' : this.isTeacher,
      'profilePhoto': this.profilePhoto,
      'ratePerHour': this.ratePerHour,
      'basicInfo': this.basicInfo,
      'education': this.education,
      'experience': this.experience
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
      'specialization': this.specialization,
      'education': this.education,
      'experience': this.experience
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
