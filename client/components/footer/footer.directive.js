'use strict';

angular.module('takhshilaApp')
  .directive('footer', function () {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
      }
    };
  });