'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('classBookResponse', {
        url: '/class/:status/:txnID',
        templateUrl: 'app/class/class.html',
        controller: 'ClassCtrl',
        navStick: true
      });
  });