'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($mdDialog, $scope) {
    $scope.message = 'Hello';
    $scope.loginFormData = {
      email: null,
      password: null,
    }

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    $scope.validate = function(form){

    }
  });
