'use strict';

// Production specific configuration
// =================================
module.exports = {
  siteBase: 'https://www.takhshila.com',
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            443,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            'mongodb://takhshila-staging:takhshilaStaging123@localhost/takhshila-staging'
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

  msg91: {
    apiBase: "http://api.msg91.com/api/sendhttp.php",
    authkey: "181964ASuehXXhrB59fb3097",
    sender: "TKHSLA",
    route: 4
  },
  
  bulkSMS: {
    apiBase: "http://login.bulksmsgateway.in/sendmessage.php",
    user: "pratikraj26",
    password: "Jh@ri@123",
    sender: "TKHSLA",
    type: 3
  },
  
  seedDB: true
};