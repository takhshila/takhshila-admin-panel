'use strict';

describe('Controller: VerifyOtpModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var VerifyOtpModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VerifyOtpModalCtrl = $controller('VerifyOtpModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
