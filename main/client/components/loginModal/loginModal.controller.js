'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($rootScope, $mdDialog, $scope, $state, Auth) {
    $scope.loginError = false;
    $scope.loginErrorMessage = null;
    $scope.registerError = false;
    $scope.registerErrorMessage = null;
    $scope.loginFormData = {
      phone: null,
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
      country: null,
      phone: null,
      phoneNumber: null,
      password: null,
      isTeacher: ($state.current.name === "teach") ? true: false
    }

    // $scope.selectedCountry = {
    //   active:true,
    //   code:"IN",
    //   dial_code:"91",
    //   name:"India",
    //   _id:"59410de6025c24614f2c7e7b"
    // }

    $scope.selectCountry = function(index){
      if($rootScope.countries[index] !== undefined){
        $scope.selectedCountry = $rootScope.countries[index];
      }
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
        $scope.loginFormData.country = $scope.selectedCountry;
        $scope.loginFormData.phone = $scope.selectedCountry.dial_code.toString() + $scope.loginFormData.phone.toString();
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
        var registerData = {
          name: {
            firstName: $scope.registerFormData.name.firstName,
            lastName: $scope.registerFormData.name.lastName
          },
          phone: $scope.registerFormData.phone,
          dialCode: $scope.selectedCountry.dial_code,
          password: $scope.registerFormData.password,
          country: $scope.selectedCountry._id
        }
        Auth.register(registerData)
        .then(function(data){
          $scope.logging = false;
          // $scope.current = 'verify-otp';
          // $scope.closeDialog();
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
        var registerData = {
          name: {
            firstName: $scope.registerFormData.name.firstName,
            lastName: $scope.registerFormData.name.lastName
          },
          phone: $scope.registerFormData.phone,
          dialCode: $scope.selectedCountry.dial_code,
          password: $scope.registerFormData.password,
          country: $scope.selectedCountry._id
        }
        Auth.sendVerificationCode(registerData)
        .then(function(data){
          $scope.logging = false;
          // $scope.current = 'verify-otp';
          // $scope.closeDialog();
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

    $rootScope.populateCountries()
    .then(function(){
      $scope.countries = $rootScope.countries;
    });

  });
