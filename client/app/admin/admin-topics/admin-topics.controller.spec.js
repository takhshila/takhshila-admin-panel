'use strict';

describe('Controller: AdminTopicsCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AdminTopicsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminTopicsCtrl = $controller('AdminTopicsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
