'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user', {
        url: '/user/:ID',
        templateUrl: 'app/user/user.html',
        controller: 'UserCtrl',
        navStick: true
      });
  });
