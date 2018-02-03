'use strict';

angular.module('takhshilaApp')
  .controller('LoginCtrl', function ($rootScope, $scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $rootScope.isLoading = false;

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
