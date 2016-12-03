'use strict';

angular.module('takhshilaApp')
  .factory('userFactory', function (api) {
    var subUrl = 'users/'
    var userFactory = {
      getUserDetails: function( id ){
          return api.get(subUrl, id);
      },
    }

    return userFactory;
  });
