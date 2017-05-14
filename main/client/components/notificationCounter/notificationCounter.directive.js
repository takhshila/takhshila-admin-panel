'use strict';

angular.module('takhshilaApp')
  .directive('notificationCounter', function (notificationFactory) {
    return {
      templateUrl: 'components/notificationCounter/notificationCounter.html',
      restrict: 'E',
      replace: true,
      scope: {

      },
      link: function (scope, element, attrs) {
      	scope.notificationCount = 0;
      	notificationFactory.getNotification()
      	.success(function(response){
      		for(var i = 0; i < response.length; i++){
      			if(response[i].notificationStatus === "unread"){
      				scope.notificationCount++;
      			}
      		}
      		console.log(response);
      	})
      	.error(function(err){
      		console.log(err);
      	})
      }
    };
  });