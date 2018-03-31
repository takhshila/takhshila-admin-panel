'use strict';

describe('Controller: AdminUsersCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AdminUsersCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminUsersCtrl = $controller('AdminUsersCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
