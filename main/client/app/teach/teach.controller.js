'use strict';

angular.module('takhshilaApp')
  .controller('TeachCtrl', function ($scope) {
    $scope.scroll = null;
    $scope.navStick = false;

    $scope.$watch('scroll', function(value){
      if(value > 400){
        $scope.navStick = true;
      }else{
        $scope.navStick = false;
      }
    });
  });
