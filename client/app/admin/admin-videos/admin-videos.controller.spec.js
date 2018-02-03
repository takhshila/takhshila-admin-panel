'use strict';

describe('Controller: AdminVideosCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AdminVideosCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminVideosCtrl = $controller('AdminVideosCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
