'use strict';

angular.module('takhshilaApp')
  .factory('searchFactory', function (api) {
  	var subUrl = 'search/'
  	var searchFactory = {
      search: function( params ){
          return api.get(subUrl, 'teacher', params);
      }
  	}

  	return searchFactory;
  });
