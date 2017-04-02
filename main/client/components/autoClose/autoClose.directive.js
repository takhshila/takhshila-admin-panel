'use strict';

angular.module('takhshilaApp')
  .directive('autoClose', function ($document) {
    return {
      restrict: 'A',
		scope: {
			autoClose:'='
		},
      link: function (scope, element, attrs) {
        angular.element($document).bind("click", function(e) {
			if(!$(element).has(e.target).length && !$(element).is($(e.target))){
				scope.autoClose = false;
				scope.$apply();
			}
        });
      }
    };
  });