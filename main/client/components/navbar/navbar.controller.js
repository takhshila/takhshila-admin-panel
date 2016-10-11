'use strict';

angular.module('takhshilaApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $state, Auth) {
    $scope.$watch(function(){
      return $state.current.navStick;
    }, function(stickyNav){
      if(stickyNav){
        $rootScope.navStick = true;
      }else{
        $rootScope.navStick = false;
      }
    });
    $scope.$watch('scroll', function(value){
      if(!$state.current.navStick){
        if(value > 400){
          $rootScope.navStick = true;
        }else{
          $rootScope.navStick = false;
        }
      }
    });
  });
