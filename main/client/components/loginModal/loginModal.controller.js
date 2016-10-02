'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($mdDialog, $scope, Auth) {
    $scope.message = 'Hello';
    $scope.loginFormData = {
      email: null,
      password: null,
    }
    $scope.forgotPasswordFormData = {
      email: null
    }
    $scope.registerFormData = {
      name: {
        firstName: null,
        lastName: null
      },
      email: null,
      password: null
    }

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    $scope.validate = function(form){

    }

    $scope.signUp = function(registerForm){
      console.log(registerForm);
      if(registerForm.$invalid){
        // var el = angular.element("[name='" + registerForm.$name + "']").find('.ng-invalid:visible:first');
        // var elName = el[0].name;
        // registerForm[elName].$dirty = true;
        // registerForm[elName].$pristine = false;
        // angular.element("[name='" + registerForm.$name + "']").find('.ng-invalid:visible:first').focus();
        return false;
      }else{
        $scope.logging = true;
        console.log($scope.registerFormData);
        Auth.createUser($scope.registerFormData)
        .then(function(data){
          $scope.logging = false;
          console.log(data);
        }, function(err){
          $scope.logging = false;
          console.log(err);
        })
      }
    }
  });
