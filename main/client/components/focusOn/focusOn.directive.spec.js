'use strict';

describe('Directive: focusOn', function () {

  // load the directive's module
  beforeEach(module('takhshilaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<focus-on></focus-on>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the focusOn directive');
  }));
});