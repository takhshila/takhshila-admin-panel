'use strict';

angular.module('takhshilaApp')
  .service('transactionFactory', function (api) {
  	var subUrl = 'transactions/'
  	var transactionFactory = {
      initiate: function( params ){
          return api.post(subUrl + 'initiate', params);
      }
  	}

  	return transactionFactory;
  });
