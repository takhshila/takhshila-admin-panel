'use strict';

// Production specific configuration
// =================================
module.exports = {
  siteBase: 'http://www.takhshila.com',
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