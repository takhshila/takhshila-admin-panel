'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('bookingStatus', {
        url: '/booking-status/:status/:txnID',
        templateUrl: 'app/bookingStatus/bookingStatus.html',
        controller: 'BookingStatusCtrl'
      });
  });