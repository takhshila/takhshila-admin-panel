'use strict';

describe('Controller: VideoUploadModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var VideoUploadModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VideoUploadModalCtrl = $controller('VideoUploadModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
