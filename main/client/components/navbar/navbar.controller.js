'use strict';

angular.module('takhshilaApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $state, Auth) {
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

    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        if($rootScope.currentUser.isTeacher){
          if(!(
            $rootScope.currentUser.availability
            && $rootScope.currentUser.education.length > 0
            && $rootScope.currentUser.experience.length > 0
            && $rootScope.currentUser.specialization.length > 0
            && $rootScope.currentUser.ratePerHour.value
            && $rootScope.currentUser.basicInfo
            )){
            $rootScope.isProfileLive = false;
          }
        }
        $rootScope.getLastClass()
        .then(function(response){
          var classData = response.data;
          if(classData.status === 'completed'){
            $rootScope.getUserClassReview(classData._id)
            .then(function(reviews){
              if(reviews.data.length === 0){
                $rootScope.showReviewDialog = true;
                $rootScope.reviewDialogData = classData;
              }
            }, function(err){
              console.log(err);
            })
          }
        }, function(err){
          console.log(err);
        });
      }
    });
  });
