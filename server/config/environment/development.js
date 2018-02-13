'use strict';

// Development specific configuration
// ==================================
module.exports = {
	siteBase: 'http://localhost:9000',

	// Server port
	port: 	9002,
	// MongoDB connection options
	mongo: {
		uri: 'mongodb://localhost/takhshila-dev'
	},
	
	payu: {
		merchantID: 4934580,
		key: 'rjQUPktU',
		salt: 'e5iIg1jwi8',
		authorizationHeader: 'y8tNAC1Ar0Sd8xAHGjZ817UGto5jt37zLJSX/NHK3ok=',
		host: 'https://test.payumoney.com',
		path: {
			paymentResponse: '/payment/op/getPaymentResponse'
		}
	},
	// sslServer: true,

	bulkSMS: {
		apiBase: "http://login.bulksmsgateway.in/sendmessage.php",
		user: "pratikraj26",
		password: "Jh@ri@123",
		sender: "TKHSLA",
		type: 3
	},

	sendTextMessage: false,

	msg91: {
		apiBase: "http://api.msg91.com/api/sendhttp.php",
		authkey: "181964ASuehXXhrB59fb3097",
		sender: "TKHSLA",
		route: 4
	},

	textLocal: {
		apiBase: "https://api.textlocal.in/send",
		apiKey: "Yalfd/Icifs-st5uslQnVGbeqSpSnOkar0VcL4ZVV7",
		user: "pratikraj26@gmail.com",
		password: "Jh@ri@123",
		sender: "TKHSLA",
		hash: "22d8a965b44e3f8d9271cd2bf95ed482b3b1539e639a9df1251c269318fada30"
	},
	
	seedDB: true
};
