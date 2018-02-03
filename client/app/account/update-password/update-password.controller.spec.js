'use strict';

describe('Controller: UpdatePasswordCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var UpdatePasswordCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UpdatePasswordCtrl = $controller('UpdatePasswordCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
