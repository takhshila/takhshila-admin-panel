'use strict';

angular.module('takhshilaApp')
  .service('transactionFactory', function (api) {
  	var subUrl = 'transactions/'
  	var transactionFactory = {
      initiatePayment: function( params ){
          return api.post(subUrl + 'payment/initiate', params);
      }
  	}

  	return transactionFactory;
  });
