'use strict';

angular.module('takhshilaApp')
  .directive('starRating', function ($rootScope) {
    return {
      templateUrl: 'components/starRating/starRating.html',
      scope: {
        ratingValue: '=ngModel',
        max: '=?',
        onRatingSelect: '&?',
        readonly: '=?'
      },
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.max = 5;
        if(!scope.ratingValue){
        	scope.ratingValue = 0;
        }
        function updateStars() {
          scope.stars = [];
          for (var i = 0; i < scope.max; i++) {
            scope.stars.push({
              filled: i < scope.ratingValue
            });
          }
        };
        scope.toggle = function($event, index) {
        	// angular.element(element).addClass('ng-hide');
			if (scope.readonly == undefined || scope.readonly === false){
				scope.ratingValue = index + 1;
				$rootScope.reviewDialogData.ratingValue = index + 1;
				// scope.onRatingSelect({
				// 	rating: index + 1
				// });
			}
        };
        scope.$watch('ratingValue', function(oldValue, newValue) {
			if (newValue || newValue === 0) {
				updateStars();
			}
        });
        updateStars();
      }
    };
  });