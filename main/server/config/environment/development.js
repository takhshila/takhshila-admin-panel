'use strict';

// Development specific configuration
// ==================================
module.exports = {
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
	seedDB: true
};
