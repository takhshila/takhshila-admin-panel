'use strict';

angular.module('takhshilaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl',
        navStick: true,
        authenticate: false
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl',
        navStick: true,
        authenticate: false
      })
      .state('signupReferral', {
        url: '/signup/:referralID',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl',
        navStick: true,
        authenticate: false
      })
      .state('forget-password', {
        url: '/forget-password',
        templateUrl: 'app/account/forget-password/forget-password.html',
        controller: 'ForgetPasswordCtrl',
        navStick: true,
        authenticate: false
      })
      .state('update-password', {
        url: '/update-password',
        templateUrl: 'app/account/update-password/update-password.html',
        controller: 'UpdatePasswordCtrl',
        navStick: true,
        authenticate: true
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
      .state('wallet', {
        url: '/wallet',
        templateUrl: 'app/account/wallet/wallet.html',
        controller: 'WalletCtrl',
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
