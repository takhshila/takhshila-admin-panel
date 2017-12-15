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
            8080,

  // MongoDB connection options
  mongo: {
    uri:    'mongodb://takhshila-prod:takhshilaProd123@localhost/takhshila'
  },

  sslServer: false,

  seedDB: true,

  msg91: {
    apiBase: "http://api.msg91.com/api/sendhttp.php",
    authkey: "181964ASuehXXhrB59fb3097",
    sender: "TKHSLA",
    route: 4
  },
  
  payu: {
    merchantID: 5804204,
    key: 'vQqpeAeQ',
    salt: 'WA7eXxUoRF',
    authorizationHeader: '1mCD5YnSWir3SceFM1PP8BJ3ACgv1wkypEAsWdQUPqk=',
    host: 'https://secure.payumoney.com',
    path: {
      paymentResponse: '/payment/op/getPaymentResponse'
    }
  }
};