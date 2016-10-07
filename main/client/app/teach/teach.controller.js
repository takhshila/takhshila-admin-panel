'use strict';

angular.module('takhshilaApp')
  .controller('TeachCtrl', function ($scope,  $mdDialog) {
    $scope.scroll = null;
    $scope.navStick = false;

    $scope.showAddDialog = function($event){
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/loginModal/loginModal.html',
        controller: 'LoginModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true
      });
    }
    
    $scope.$watch('scroll', function(value){
      if(value > 400){
        $scope.navStick = true;
      }else{
        $scope.navStick = false;
      }
    });
  });
