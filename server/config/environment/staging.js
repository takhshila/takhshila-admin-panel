'use strict';

// Production specific configuration
// =================================
module.exports = {
  siteBase: 'https://staging.takhshila.com',
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            8082,

  // MongoDB connection options
  mongo: {
    uri:    'mongodb://takhshila_staging:takhshilaStaging123@localhost/takhshila_staging'
  },

  sslServer: true,
  
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

  sendTextMessage: false,

  msg91: {
    apiBase: "http://api.msg91.com/api/sendhttp.php",
    authkey: "181964ASuehXXhrB59fb3097",
    sender: "TKHSLA",
    route: 4
  },
  
  seedDB: true
};
