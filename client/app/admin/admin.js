'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl',
        navStick: true,
        authenticate: true
      })
      .state('adminusers', {
        url: '/admin/users',
        templateUrl: 'app/admin/admin-users/admin-users.html',
        controller: 'AdminUsersCtrl',
        navStick: true,
        authenticate: true
      })
      .state('admintopics', {
        url: '/admin/topics',
        templateUrl: 'app/admin/admin-topics/admin-topics.html',
        controller: 'AdminTopicsCtrl',
        navStick: true,
        authenticate: true
      })
      .state('adminvideos', {
        url: '/admin/videos',
        templateUrl: 'app/admin/admin-videos/admin-videos.html',
        controller: 'AdminVideosCtrl',
        navStick: true,
        authenticate: true
      })
      .state('adminpayments', {
        url: '/admin/payments',
        templateUrl: 'app/admin/admin-payments/admin-payments.html',
        controller: 'AdminPaymentsCtrl',
        navStick: true,
        authenticate: true
      });
  });