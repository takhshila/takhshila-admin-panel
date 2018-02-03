var config = require('../config/environment');
var querystring = require('querystring');
var request = require('request');

exports.sendTextMessage = function(dialCode, phone, message) {
	return new Promise(function(resolve, reject){
		var url = config.msg91.apiBase;
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/json'
		}
		var queryParams = {
			sender: config.msg91.sender,
			route: config.msg91.route,
			mobiles: dialCode + phone,
			authkey: config.msg91.authkey,
			country: dialCode,
			message: message
		}
		var options = {
			url: url,
			method: 'GET',
			headers: headers,
			qs: queryParams
		}

		// console.log("phone");
		// console.log(phone);

		// client.messages.create(
		// 	8447227929,
		// 	phone,
		// 	message
		// 	).then(function(message_created) {
		// 		console.log("message_created");
		// 		console.log(message_created);
		// 		resolve(message_created)
		// 	}, function(err){
		// 		console.log("err");
		// 		console.log(err);
		// 		reject(err);
		// 	});
		// });
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve();
			}else{
				reject(error);
			}
		});
	});
};


exports.getRandomNuber = function(digits){
	return Math.floor(Math.random()*parseInt('8' + '9'.repeat(digits-1))+parseInt('1' + '0'.repeat(digits-1)));
}