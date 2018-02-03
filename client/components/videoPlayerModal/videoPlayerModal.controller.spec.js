'use strict';

describe('Controller: VideoPlayerModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var VideoPlayerModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VideoPlayerModalCtrl = $controller('VideoPlayerModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
