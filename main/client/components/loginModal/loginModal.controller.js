'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($mdDialog, $scope) {
    $scope.message = 'Hello';
    $scope.loginForm = {
      email: null,
      password: null
    }

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };
  });
