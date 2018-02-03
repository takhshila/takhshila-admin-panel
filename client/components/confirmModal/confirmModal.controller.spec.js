'use strict';

describe('Controller: ConfirmModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var ConfirmModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConfirmModalCtrl = $controller('ConfirmModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
