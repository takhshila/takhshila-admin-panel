'use strict';

angular.module('takhshilaApp')
  .controller('UserCtrl', function ($rootScope, $scope, $stateParams, userFactory) {
    $rootScope.isLoading = true;
    userFactory.getUserDetails($stateParams.ID)
    .success(function(response){
      $rootScope.isLoading = false;
      console.log(response);
    })
    .error(function(err){
      $rootScope.isLoading = false;
      console.log(err);
    })
  });
