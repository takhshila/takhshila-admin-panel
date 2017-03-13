'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('liveclass', {
        url: '/liveclass',
        templateUrl: 'app/liveclass/liveclass.html',
        controller: 'LiveclassCtrl'
      });
  });