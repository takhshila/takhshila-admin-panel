'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($mdDialog, $scope, $state, Auth) {
    $scope.loginError = false;
    $scope.loginErrorMessage = null;
    $scope.registerError = false;
    $scope.registerErrorMessage = null;
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
      password: null,
      isTeacher: ($state.current.name === "teach") ? true: false
    }

    $scope.closeDialog = function() {
      $mdDialog.hide();
    };

    $scope.validate = function(loginForm){
      if(loginForm.$invalid){
        var el = angular.element("[name='" + loginForm.$name + "']").find('.ng-invalid:visible:first');
        var elName = el[0].name;
        loginForm[elName].$dirty = true;
        loginForm[elName].$pristine = false;
        angular.element("[name='" + loginForm.$name + "']").find('.ng-invalid:visible:first').focus();
        return false;
      }else{
        $scope.logging = true;
        Auth.login($scope.loginFormData)
        .then(function(data){
          $scope.logging = false;
          $scope.closeDialog()
        }, function(err){
          $scope.logging = false;
          $scope.loginError = true;
          $scope.loginErrorMessage = err.message;
          angular.element("[name='" + loginForm.$name + "'] [name='email']").focus();
        })
      }
    }

    $scope.signUp = function(registerForm){
      if(registerForm.$invalid){
        var el = angular.element("[name='" + registerForm.$name + "']").find('.ng-invalid:visible:first');
        var elName = el[0].name;
        registerForm[elName].$dirty = true;
        registerForm[elName].$pristine = false;
        angular.element("[name='" + registerForm.$name + "']").find('.ng-invalid:visible:first').focus();
        return false;
      }else{
        $scope.logging = true;
        Auth.createUser($scope.registerFormData)
        .then(function(data){
          $scope.logging = false;
          $scope.closeDialog();
        }, function(err){
          $scope.logging = false;
          for(var error in err.data.errors){
            registerForm[error].$valid = false;
            registerForm[error].$invalid = true;
            registerForm[error].$error.serverError = true;
            registerForm[error].$error.errorMessage = err.data.errors[error].message;
            angular.element("[name='" + registerForm.$name + "'] [name='" + error + "']").focus();
          }
        })
      }
    }
  });
