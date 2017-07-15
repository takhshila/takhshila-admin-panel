'use strict';

describe('Controller: AddExperienceModalCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var AddExperienceModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddExperienceModalCtrl = $controller('AddExperienceModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
