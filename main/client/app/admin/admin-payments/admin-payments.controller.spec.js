'use strict';

describe('Controller: AdminPaymentsCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AdminPaymentsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminPaymentsCtrl = $controller('AdminPaymentsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
