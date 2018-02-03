'use strict';

angular.module('takhshilaApp')
  .factory('notificationFactory', function (api) {
  	var subUrl = 'notifications/'
  	var notificationFactory = {
      getNotification: function(){
        return api.get(subUrl, '', '');
      },

      updateNotification: function(){
      	return api.put(subUrl, '', '');
      }
  	}

  	return notificationFactory;
  });
