'use strict';

describe('Directive: navbar', function () {

  // load the directive's module and view
  beforeEach(module('takhshilaApp'));
  beforeEach(module('components/navbar/navbar.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<navbar></navbar>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the navbar directive');
  }));
});