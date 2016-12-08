'use strict';

describe('Directive: scrollToItem', function () {

  // load the directive's module
  beforeEach(module('takhshilaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scroll-to-item></scroll-to-item>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the scrollToItem directive');
  }));
});