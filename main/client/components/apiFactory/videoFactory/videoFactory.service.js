'use strict';

angular.module('takhshilaApp')
  .service('videoFactory', function (api) {
    var subUrl = 'videos/'
    var videoFactory = {
      getUserVideos: function( id ){
          return api.get(subUrl + 'user/', id);
      }
      // getAvailability: function(id, params){
      //   return api.post(subUrl + 'availability/' + id, params);
      // },
      // getCurrentUserAvailability: function(){
      //   return api.get(subUrl + 'availability', '', '');
      // },
      // updateAvailability: function(data){
      //   return api.put(subUrl, 'availability', data);
      // },
      // updateBasicInfo: function(data){
      //   return api.put(subUrl, 'basicinfo', data);
      // },
      // updateProfilePhoto: function(data){
      //   return api.put(subUrl, 'profilephoto', data);
      // },
      // addSpecialization: function(data){
      //   return api.post(subUrl + 'specialization', data);
      // },
      // deleteSpecialization: function(id){
      //   return api.delete(subUrl + 'specialization/', id, {});
      // },
      // addEducation: function(data){
      //   return api.post(subUrl + 'education', data);
      // },
      // updateEducation: function(id, data){
      //   return api.putData(subUrl + 'education/', id, data);
      // },
      // deleteEducation: function(id){
      //   return api.delete(subUrl + 'education/', id, {});
      // }
    }

    return videoFactory;
  });
