'use strict';

angular.module('takhshilaApp')
  .factory('userFactory', function (api) {
    var subUrl = 'users/'
    var userFactory = {
      register: function( data ){
          return api.post(subUrl + 'register/', data);
      },
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
      },
      addEducation: function(data){
        return api.post(subUrl + 'education', data);
      },
      updateEducation: function(id, data){
        return api.putData(subUrl + 'education/', id, data);
      },
      deleteEducation: function(id){
        return api.delete(subUrl + 'education/', id, {});
      },
      addExperience: function(data){
        return api.post(subUrl + 'experience', data);
      },
      updateExperience: function(id, data){
        return api.putData(subUrl + 'experience/', id, data);
      },
      deleteExperience: function(id){
        return api.delete(subUrl + 'experience/', id, {});
      },
      updateRatePerHour: function(data){
        return api.putData(subUrl, 'rateperhour', data);
      },
    }

    return userFactory;
  });
