'use strict';

angular.module('takhshilaApp')
  .directive('focusOn', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(attrs.focusOn, function (value) {
            if (value === true) {
                for (var i = 0; i < element.length; i++) {
                    var ele = angular.element(element[i].parentNode);
                    if (!ele.hasClass('ng-hide')) { //Skip those elements which are hidden.
                        element[i].focus();
                    }
                }
            }
        });
      }
    };
  });
