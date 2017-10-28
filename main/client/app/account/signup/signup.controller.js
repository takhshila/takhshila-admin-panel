'use strict';

angular.module('takhshilaApp')
  .controller('SignupCtrl', function ($rootScope, $scope, $state, $stateParams, $mdDialog, $http, Auth, $location, $window) {
    $scope.registerError = false;
    $scope.giftFrom = null;
    $rootScope.isLoading = false;
    var referralID = $stateParams.referralID || null;

    $scope.registerFormData = {
      name: {
        firstName: null,
        lastName: null
      },
      country: null,
      phone: null,
      phoneNumber: null,
      password: null,
      isTeacher: false,
      referralID: null
    }

    var fetchReferralDetails = function(referralID){
      return $http.get('/api/v1/users/referral/' + referralID);
    }

    if(referralID){
      fetchReferralDetails(referralID)
      .then(function(response){
        $scope.registerFormData.referralID = referralID;
        $scope.giftFrom = response.data.name.firstName + ' ' + response.data.name.lastName;
      })
      .catch(function(err){
        console.log(err);
        $scope.registerFormData.referralID = null;
      })
    }

    $scope.selectCountry = function(index){
      if($rootScope.countries[index] !== undefined){
        $scope.selectedCountry = $rootScope.countries[index];
      }
    }

    $scope.signUp = function(registerForm){
      $scope.registerError = false;
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
          country: $scope.selectedCountry._id,
          isTeacher: $scope.registerFormData.isTeacher,
          referralID: $scope.registerFormData.referralID
        }
        Auth.register(registerData)
        .then(function(data){
          $scope.logging = false;
          if(data.success){
            $scope.registeredId = data.id;
            $scope.current = 'verify-otp';
            var parentEl = angular.element(document.body);
            $mdDialog.show({
              templateUrl: 'components/verifyOtpModal/verifyOtpModal.html',
              controller: 'VerifyOtpModalCtrl',
              parent: parentEl,
              disableParentScroll: true,
              clickOutsideToClose: false,
              locals: {
                userId: data.id,
                generateToken: true
              },
              onRemoving: function (event, removePromise) {
                removePromise
                .then(function(){
                  console.log('Modal Removed');
                  if($rootScope.loggedIn){
                    $state.go('profile');
                  }
                })
                .catch(function(err){
                  console.log(err);
                });
              }
            });
          }else{
            $scope.registerError = true;
            $scope.registerErrorMessage = data.error;
          }
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
        $scope.verifyOTPFormData.generateToken = true;
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
      $scope.selectedCountry = $scope.countries[0];
    });
  });
