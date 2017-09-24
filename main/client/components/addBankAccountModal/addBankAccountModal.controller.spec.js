'use strict';

describe('Controller: AddBankAccountModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AddBankAccountModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddBankAccountModalCtrl = $controller('AddBankAccountModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
