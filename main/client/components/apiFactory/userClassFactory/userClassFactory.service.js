'use strict';

angular.module('takhshilaApp')
  .factory('userClassFactory', function (api) {
    var subUrl = 'userClasses/'
    var userFactory = {
      getClasses: function(params){
        return api.getList(subUrl, params);
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
