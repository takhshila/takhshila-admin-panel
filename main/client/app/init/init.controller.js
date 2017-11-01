'use strict';

angular.module('takhshilaApp')
  .controller('InitCtrl', function ($rootScope, $scope, $state, $mdDialog, $q, $http, Auth) {
    $rootScope.countries = [];
    $rootScope.isProfileLive = true;
    $rootScope.showReviewDialog = false;
    $rootScope.reviewDialogData = {};

    $scope.$watch(function(){
      return $state.current.name;
    }, function(stateName){
      if(stateName != null && stateName != ''){
        Auth.isLoggedInAsync(function(loggedIn){
          $rootScope.currentUser = Auth.getCurrentUser();
          $rootScope.loggedIn = loggedIn;
          if(typeof $state.current.authenticate !== "undefined"){
            if($state.current.authenticate && !loggedIn){
              $state.go('main');
            }
            if(!$state.current.authenticate && loggedIn){
              $state.go('main');
            }
          }
          $scope.$watch(function(){
            return Auth.isLoggedIn();
          }, function(data){
            $rootScope.loggedIn = data;
            if(typeof $state.current.authenticate !== "undefined"){
              if($state.current.authenticate && !data){
                $state.go('main');
              }
              if(!$state.current.authenticate && data){
                $state.go('main');
              }
            }
            $rootScope.currentUser = Auth.getCurrentUser();
          });
        });
      }
    });

    $rootScope.showLoginModal = function($event){
      $event.preventDefault();
      $event.stopPropagation();
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/loginModal/loginModal.html',
        controller: 'LoginModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true
      });
    }

    $rootScope.showSignupModal = function($event){
      $event.preventDefault();
      $event.stopPropagation();
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        templateUrl: 'components/signupModal/signupModal.html',
        controller: 'SignupModalCtrl',
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

    $rootScope.showVideoUploadModal = function($event, videoData){
      var parentEl = angular.element(document.body);
      var modalData = {
        templateUrl: 'components/videoUploadModal/videoUploadModal.html',
        controller: 'VideoUploadModalCtrl',
        parent: parentEl,
        targetEvent: $event,
        disableParentScroll: true,
        clickOutsideToClose: false,
        locals: {
          videoData: null
        }
      }
      if(videoData !== undefined){
        modalData.locals.videoData = videoData;
      }
      $mdDialog.show(modalData);
    }

    $rootScope.populateCountries = function(){
      var deferred = $q.defer();
      if(!$rootScope.countries.length){
        return $http.get('/api/v1/countries').then(function(response){
          $rootScope.countries = response.data;
          deferred.resolve();
        }, function(err){
          deferred.resolve();
        });
      }else{
        deferred.resolve();
      }
      return deferred.promise;
    }

    $rootScope.getLastClass = function(){
      var deferred = $q.defer();
      if($rootScope.currentUser){
        $http.get('/api/v1/userclasses/last').then(function(response){
          if(response){
            deferred.resolve(response);
          }else{
            deferred.reject();
          }
          deferred.resolve();
        }, function(err){
          deferred.reject();
        });
      }
      return deferred.promise;
    }

    $rootScope.getUserClassReview = function(classID){
      var deferred = $q.defer();
      if($rootScope.currentUser){
        $http.get('/api/v1/reviews/class/' + classID).then(function(response){
          deferred.resolve(response);
        }, function(err){
          deferred.reject();
        });
      }
      return deferred.promise;
    }

    $rootScope.logout = function(){
      Auth.logout();
    }

    $rootScope.populateCountries();
  });
