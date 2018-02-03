'use strict';

angular.module('takhshilaApp')
  .directive('navbar', function ($window) {
    return {
      templateUrl: 'components/navbar/navbar.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
          scope.scroll = this.pageYOffset;
          scope.$apply();
        });
      }
    };
  });
