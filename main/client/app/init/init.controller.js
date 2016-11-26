'use strict';

angular.module('takhshilaApp')
  .controller('InitCtrl', function ($rootScope, $scope, $state, $mdDialog, Auth) {
    $scope.$watch(function(){
      return $state.current.name;
    }, function(stateName){
      if(stateName != null && stateName != ''){
        Auth.isLoggedInAsync(function(loggedIn){
          $rootScope.currentUser = Auth.getCurrentUser();
          $rootScope.loggedIn = loggedIn;
          if($state.current.authenticate && !loggedIn){
            $state.go('main');
          }
          if(!$state.current.authenticate && loggedIn){
            $state.go('main');
          }
          $scope.$watch(function(){
            return Auth.isLoggedIn();
          }, function(data){
            $rootScope.loggedIn = data;
            if($state.current.authenticate && !data){
              $state.go('main');
            }
            if(!$state.current.authenticate && data){
              $state.go('main');
            }
            $rootScope.currentUser = Auth.getCurrentUser();
          });
        });
      }
    });

    $rootScope.showLoginModal = function($event){
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/loginModal/loginModal.html',
        controller: 'LoginModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true
      });
    }

    $rootScope.showProfilePicModal = function($event){
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/profilePicModal/profilePicModal.html',
        controller: 'ProfilePicModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: true
      });
    }

    $rootScope.showVideoUploadModal = function($event){
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/videoUploadModal/videoUploadModal.html',
        controller: 'VideoUploadModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: true
      });
    }

    $rootScope.logout = function(){
      Auth.logout();
    }
  });
