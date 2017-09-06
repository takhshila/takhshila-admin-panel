'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/takhshila'
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
  }
};