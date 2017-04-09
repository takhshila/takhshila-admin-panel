'use strict';

describe('Controller: AddEducationModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AddEducationModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddEducationModalCtrl = $controller('AddEducationModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
