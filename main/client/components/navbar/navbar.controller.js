'use strict';

angular.module('takhshilaApp')
  .controller('NavbarCtrl', function ($scope, $mdDialog, Auth) {
    $scope.$watch(function(){
      return Auth.isLoggedIn();
    }, function(data){
      $scope.loggedIn = data;
    });
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
    $scope.logout = function(){
      Auth.logout();
    }
    $scope.$watch('scroll', function(value){
      // console.log(value);
    });
  });
