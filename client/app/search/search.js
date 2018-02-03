'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('search', {
        url: '/search?topic&level',
        templateUrl: 'app/search/search.html',
        controller: 'SearchCtrl',
        navStick: true
      });
  });