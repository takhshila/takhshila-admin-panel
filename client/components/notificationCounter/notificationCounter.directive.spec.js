'use strict';

describe('Directive: notificationCounter', function () {

  // load the directive's module and view
  beforeEach(module('takhshilaApp'));
  beforeEach(module('components/notificationCounter/notificationCounter.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<notification-counter></notification-counter>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the notificationCounter directive');
  }));
});