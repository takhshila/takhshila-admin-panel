'use strict';

describe('Directive: videoSlider', function () {

  // load the directive's module and view
  beforeEach(module('takhshilaApp'));
  beforeEach(module('components/videoSlider/videoSlider.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<video-slider></video-slider>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the videoSlider directive');
  }));
});