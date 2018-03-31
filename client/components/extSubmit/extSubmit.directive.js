'use strict';

angular.module('takhshilaApp')
  .directive('extSubmit', function ($timeout) {
    return {
		restrict: 'A',
		link: function($scope, $el, $attr) {
		    $scope.$on('processFormSubmit', function(event, data){
		    	console.log("Received Data", data);
				if(data.formName === $attr.name) {
					$timeout(function(){
						$el.submit();
					}, 0, false)
					// $el[0].dispatchEvent(new Event('submit'));
				}
		    })
		}
    };
  });