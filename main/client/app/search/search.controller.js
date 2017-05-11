'use strict';

angular.module('takhshilaApp')
  .controller('SearchCtrl', function ($rootScope, $scope, $stateParams) {
    $rootScope.isLoading = false;
    console.log($stateParams);
  });
