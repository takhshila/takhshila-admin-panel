/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var forceSSL = require('express-force-ssl');
var config = require('./config/environment');

// Connect to database
var conn = mongoose.connect(config.mongo.uri, config.mongo.options);

// mongoose.connection.on('open', function(){
//     conn.connection.db.dropDatabase(function(err, result){
//         console.log(err);
//         console.log(result);
//     });
// });


mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
});

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var fs = require('fs');

var server = null;

if(config.sslServer){
	var options = {
	  key: fs.readFileSync(config.root + '/server/cert/key.pem'),
	  cert: fs.readFileSync(config.root + '/server/cert/cert.pem')
	};
	require('http').createServer(app).listen(80);
	server = require('https').createServer(options, app);
	app.set('forceSSLOptions', {
	  enable301Redirects: true,
	  trustXFPHeader: false,
	  httpsPort: 443,
	  sslRequiredMessage: 'SSL Required.'
	});
}else{
	server = require('http').createServer(app);
}

var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app, server);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
