'use strict';

describe('Controller: ProfilePicModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var ProfilePicModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfilePicModalCtrl = $controller('ProfilePicModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
