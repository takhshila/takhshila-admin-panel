'use strict';

describe('Controller: SignupModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var SignupModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SignupModalCtrl = $controller('SignupModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
