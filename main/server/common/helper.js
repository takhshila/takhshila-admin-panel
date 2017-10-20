var config = require('../config/environment');
var querystring = require('querystring');
var request = require('request');

exports.sendTextMessage = function(phone, message) {
  return new Promise(function(resolve, reject){
    var url = config.bulkSMS.apiBase;
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/json'
    }
    var queryParams = {
    	user: config.bulkSMS.user,
    	password: config.bulkSMS.password,
    	sender: config.bulkSMS.sender,
    	type: config.bulkSMS.type,
    	mobile: phone,
    	message: message,
    }
    var options = {
        url: url,
        method: 'GET',
        headers: headers,
        qs: queryParams
    }
    console.log("Making request");
    console.log(options);
    request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonResponse = JSON.parse(body);
			if(jsonResponse.status === "success"){
				resolve(jsonResponse);
			}else{
				reject(jsonResponse);
			}
		}else{
			reject(error);
		}
    });
  });  
};


exports.getRandomNuber = function(digits){
	return Math.floor(Math.random()*parseInt('8' + '9'.repeat(digits-1))+parseInt('1' + '0'.repeat(digits-1)));
}