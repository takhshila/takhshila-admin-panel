'use strict';

angular.module('takhshilaApp')
  .factory('userClassFactory', function (api) {
    var subUrl = 'userClasses/'
    var userFactory = {
      getClasses: function( id ){
          return api.get(subUrl, id);
      },
      requestClass: function(id, params){
        return api.post(subUrl + id, params);
      },
      confirmClass: function(id){
        return api.put(subUrl + 'confirm/', id, '');
      },
      denyClass: function(id){
        return api.put(subUrl + 'deny/', id, '');
      }
    }

    return userFactory;
  });
