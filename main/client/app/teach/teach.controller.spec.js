'use strict';

describe('Controller: TeachCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var TeachCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TeachCtrl = $controller('TeachCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
