'use strict';

angular.module('takhshilaApp')
  .directive('classReview', function () {
    return {
      templateUrl: 'components/classReview/classReview.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });