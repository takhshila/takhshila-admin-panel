'use strict';

angular.module('takhshilaApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $state, $mdToast, socket, Auth) {
    $scope.$watch(function(){
      return $state.current.navStick;
    }, function(stickyNav){
      if(stickyNav){
        $rootScope.navStick = true;
      }else{
        $rootScope.navStick = false;
      }
    });
    
    $scope.$watch('scroll', function(value){
      if(!$state.current.navStick){
        if(value > 400){
          $rootScope.navStick = true;
        }else{
          $rootScope.navStick = false;
        }
      }
    });

    var toast = $mdToast.simple()
      .textContent('Your live class link is active.')
      .action('Go to class')
      .hideDelay(10000)
      .highlightAction(true)
      .toastClass('notification')
      .highlightClass('md-accent')
      .position('top right');

    socket.socket.on('liveClassLink', function(response){
      var classID = response.classID;
      
      $mdToast.show(toast).then(function(response) {
        if ( response == 'ok' ) {
          $state.go('main',{classID: classID});
        }
      });
    });

  });
