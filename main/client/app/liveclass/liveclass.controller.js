'use strict';

angular.module('takhshilaApp')
  .controller('LiveclassCtrl', function ($rootScope) {
    $rootScope.isLoading = false;
    var peer = new Peer({key: 'lwjd5qra8257b9'});
    console.log(peer)
  });
