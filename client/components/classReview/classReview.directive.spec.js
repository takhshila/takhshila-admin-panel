'use strict';

describe('Directive: classReview', function () {

  // load the directive's module and view
  beforeEach(module('takhshilaApp'));
  beforeEach(module('components/classReview/classReview.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<class-review></class-review>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the classReview directive');
  }));
});