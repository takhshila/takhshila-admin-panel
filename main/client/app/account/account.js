'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'ProfileCtrl',
        navStick: true,
        authenticate: true
      })
      .state('class', {
        url: '/class',
        templateUrl: 'app/account/class/class.html',
        controller: 'ClassCtrl',
        navStick: true,
        authenticate: true
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        navStick: true,
        authenticate: true
      });
  });
