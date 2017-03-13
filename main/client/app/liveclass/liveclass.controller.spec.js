'use strict';

describe('Controller: LiveclassCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var LiveclassCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LiveclassCtrl = $controller('LiveclassCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
