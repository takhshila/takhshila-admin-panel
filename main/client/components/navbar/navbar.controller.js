'use strict';

angular.module('takhshilaApp')
  .controller('NavbarCtrl', function ($scope, $mdDialog) {

    $scope.showAddDialog = function($event){
      $event.preventDefault();
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        templateUrl: 'components/loginModal/loginModal.html',
        controller: 'LoginModalCtrl'
      });
    }
  });
