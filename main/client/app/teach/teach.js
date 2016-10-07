'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teach', {
        url: '/teach',
        templateUrl: 'app/teach/teach.html',
        controller: 'TeachCtrl'
      });
  });