'use strict';

angular.module('takhshilaApp')
  .controller('LoginModalCtrl', function ($rootScope, $mdDialog, $scope, $state, Auth) {
    $scope.registeredId = null;
    $scope.loginError = false;
    $scope.loginErrorMessage = null;
    $scope.registerError = false;
    $scope.registerErrorMessage = null;
    $scope.loginFormData = {
      phone: null,
      dialCode: null,
      password: null,
    }
    $scope.verifyOTPFormData = {
      userId: null,
      otp: null
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
    //   dialCode:"91",
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
        var loginData = {
          phone: $scope.loginFormData.phone,
          dialCode: $scope.selectedCountry.dialCode,
          password: $scope.loginFormData.password
        }
        Auth.login(loginData)
        .then(function(data){
          $scope.logging = false;
          $scope.closeDialog();
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
          dialCode: $scope.selectedCountry.dialCode,
          password: $scope.registerFormData.password,
          country: $scope.selectedCountry._id
        }
        Auth.register(registerData)
        .then(function(data){
          $scope.registeredId = data.id;
          $scope.logging = false;
          $scope.current = 'verify-otp';
          // $scope.closeDialog();
        }, function(err){
          $scope.logging = false;
          for(var error in err.errors){
            registerForm[error].$valid = false;
            registerForm[error].$invalid = true;
            registerForm[error].$error.serverError = true;
            registerForm[error].$error.errorMessage = err.data.errors[error].message;
            angular.element("[name='" + registerForm.$name + "'] [name='" + error + "']").focus();
          }
        })
      }
    }

    $scope.verifyOtp = function(verifyOTPForm){
      if(verifyOTPForm.$invalid){
        var el = angular.element("[name='" + verifyOTPForm.$name + "']").find('.ng-invalid:visible:first');
        var elName = el[0].name;
        verifyOTPForm[elName].$dirty = true;
        verifyOTPForm[elName].$pristine = false;
        angular.element("[name='" + verifyOTPForm.$name + "']").find('.ng-invalid:visible:first').focus();
        return false;
      }else{
        $scope.logging = true;
        $scope.verifyOTPFormData.userId = $scope.registeredId;
        Auth.verifyOTP($scope.verifyOTPFormData)
        .then(function(data){
          $scope.logging = false;
          // $scope.current = 'verify-otp';
          $scope.closeDialog();
        }, function(err){
          $scope.logging = false;
          console.log(err);
          for(var error in err.errors){
            verifyOTPForm[error].$valid = false;
            verifyOTPForm[error].$invalid = true;
            verifyOTPForm[error].$error.serverError = true;
            $scope.verifyOtpErrorMessage = err.errors[error];
            angular.element("[name='" + verifyOTPForm.$name + "'] [name='" + error + "']").focus();
          }
        })
      }
    }

    $rootScope.populateCountries()
    .then(function(){
      $scope.countries = $rootScope.countries;
    });

  });
