'use strict';

angular.module('takhshilaApp')
  .directive('navbar', function () {
    return {
      templateUrl: 'components/navbar/navbar.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });