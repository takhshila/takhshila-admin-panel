'use strict';

describe('Controller: BookingStatusCtrl', function () {

  // load the controller's module
  beforeEach(module('takhshilaApp'));

  var BookingStatusCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BookingStatusCtrl = $controller('BookingStatusCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
