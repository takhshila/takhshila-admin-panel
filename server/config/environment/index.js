'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Should server be https?
  sslServer: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'takhshila-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },
  
  defaultData: {
    profilePhoto: 'data:image/png;base64,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'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
