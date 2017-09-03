'use strict';

describe('Controller: WalletCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var WalletCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WalletCtrl = $controller('WalletCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
