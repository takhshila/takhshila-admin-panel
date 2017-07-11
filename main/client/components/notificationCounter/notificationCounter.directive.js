'use strict';

angular.module('takhshilaApp')
  .directive('notificationCounter', function ($timeout, userClassFactory, notificationFactory) {
    
    var NotificationCounterCtrl = function($scope){
      $scope.notificationCount = 0;
      $scope.notifications = 0;

      $scope.displayNotificationCount = function(){
        $scope.notificationCount = 0;
        notificationFactory.getNotification()
        .success(function(response){
          $scope.notifications = response;
          for(var i = 0; i < response.length; i++){
           if(response[i].notificationStatus === "unread"){
             $scope.notificationCount++;
           }
          }
        })
        .error(function(err){
          console.log(err);
        })
      }

      $scope.updateNotification = function(){
        $timeout(function(){
          notificationFactory.updateNotification()
          .success(function(response){
            $scope.displayNotificationCount();
          })
          .error(function(err){
            console.log(err);
          })
        }, 2500);
      }

      $scope.confirmClass = function(evt, index){
        evt.preventDefault();
        evt.stopPropagation();
        $scope.notifications[index].processingConfirm = true;
        $scope.notifications[index].processing = true;
        userClassFactory.confirmClass($scope.notifications[index].referenceClass._id)
        .success(function(response){
          $scope.notifications[index].referenceClass.status = "confirmed";
          // $scope.displayNotificationCount();
        })
        .error(function(err){
          console.log(err);
        })
      }

      $scope.denyClass = function(evt, index){
        evt.preventDefault();
        evt.stopPropagation();
        $scope.notifications[index].processingDeny = true;
        $scope.notifications[index].processing = true;
        userClassFactory.denyClass($scope.notifications[index].referenceClass._id)
        .success(function(response){
          $scope.notifications[index].referenceClass.status = "denied";
          // $scope.displayNotificationCount();
        })
        .error(function(err){
          console.log(err);
        })
      }

      $scope.displayNotificationCount();
    }
    return {
      templateUrl: 'components/notificationCounter/notificationCounter.html',
      restrict: 'E',
      replace: true,
      scope: {
        notifications: "=notifications",
        notificationCount: "=notificationCount",
        updateNotification: "&updateNotification",
        confirmClass: "&confirmClass",
        denyClass: "&denyClass"
      },
      controller: NotificationCounterCtrl
    };
  });