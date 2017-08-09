/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/classDetailss', require('./api/classDetails'));
  app.use('/api/v1/company', require('./api/company'));
  app.use('/api/v1/languages', require('./api/language'));
  app.use('/api/v1/countries', require('./api/countries'));
  app.use('/api/v1/transactionhistory', require('./api/transactionhistory'));
  app.use('/api/v1/wallets', require('./api/wallet'));
  app.use('/api/v1/transactions', require('./api/transaction'));
  app.use('/api/v1/notifications', require('./api/notification'));
  app.use('/api/v1/search', require('./api/search'));
  app.use('/api/v1/degrees', require('./api/degree'));
  app.use('/api/v1/schools', require('./api/school'));
  app.use('/api/v1/notifications', require('./api/notification'));
  app.use('/api/v1/userclasses', require('./api/userclass'));
  app.use('/api/v1/videos', require('./api/video'));
  app.use('/api/v1/topics', require('./api/topic'));
  app.use('/api/v1/things', require('./api/thing'));
  app.use('/api/v1/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  app.route('/success')
    .post(function(req, res) {
      console.log(req.body);
      res.redirect('/success');
      // res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
