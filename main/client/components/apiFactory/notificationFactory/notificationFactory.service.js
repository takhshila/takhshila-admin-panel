'use strict';

angular.module('takhshilaApp')
  .factory('notificationFactory', function (api) {
  	var subUrl = 'notifications/'
  	var notificationFactory = {
      getNotification: function(){
          return api.get(subUrl, '', '');
      }
  	}

  	return notificationFactory;
  });
