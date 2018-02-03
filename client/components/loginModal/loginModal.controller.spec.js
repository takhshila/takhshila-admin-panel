'use strict';

describe('Controller: LoginModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var LoginModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LoginModalCtrl = $controller('LoginModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
