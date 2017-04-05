'use strict';

angular.module('takhshilaApp')
  .factory('userFactory', function (api) {
    var subUrl = 'users/'
    var userFactory = {
      getUserDetails: function( id ){
          return api.get(subUrl, id);
      },
      getAvailability: function(id, params){
        return api.post(subUrl + 'availability/' + id, params);
      },
      getCurrentUserAvailability: function(){
        return api.get(subUrl + 'availability', '', '');
      },
      updateAvailability: function(data){
        return api.put(subUrl, 'availability', data);
      },
      updateBasicInfo: function(data){
        return api.put(subUrl, 'basicinfo', data);
      },
      updateProfilePhoto: function(data){
        return api.put(subUrl, 'profilephoto', data);
      },
      addSpecialization: function(data){
        return api.post(subUrl + 'specialization', data);
      },
      deleteSpecialization: function(id){
        return api.delete(subUrl + 'specialization/', id, {});
      }
    }

    return userFactory;
  });
