'use strict';

describe('Controller: InitCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var InitCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InitCtrl = $controller('InitCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
