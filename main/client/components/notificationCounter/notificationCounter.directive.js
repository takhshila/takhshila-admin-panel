'use strict';

angular.module('takhshilaApp')
  .directive('notificationCounter', function ($timeout, notificationFactory) {
    return {
      templateUrl: 'components/notificationCounter/notificationCounter.html',
      restrict: 'E',
      replace: true,
      scope: {

      },
      link: function (scope, element, attrs) {
      	scope.notificationCount = 0;
      	scope.notifications = 0;

        scope.updateNotification = function(){
          $timeout(function(){
            notificationFactory.updateNotification()
            .success(function(response){
              console.log(response);
              scope.displayNotificationCount();
            })
            .error(function(err){
              console.log(err);
            })
          }, 2500);
        }

        scope.displayNotificationCount = function(){
        	notificationFactory.getNotification()
        	.success(function(response){
        		scope.notifications = response;
        		for(var i = 0; i < response.length; i++){
        			if(response[i].notificationStatus === "unread"){
        				scope.notificationCount++;
        			}
        		}
        	})
        	.error(function(err){
        		console.log(err);
        	})
        }

        scope.confirmClass = function(evt, index){
          evt.preventDefault();
          evt.stopPropagation();
          scope.notifications[index].processingConfirm = true;
          scope.notifications[index].processing = true;
          console.log(scope.notifications[index]);
        }
        scope.denyClass = function(evt, index){
          evt.preventDefault();
          evt.stopPropagation();
          scope.notifications[index].processingDeny = true;
          scope.notifications[index].processing = true;
          console.log(scope.notifications[index]);
        }

        scope.displayNotificationCount();
      }
    };
  });