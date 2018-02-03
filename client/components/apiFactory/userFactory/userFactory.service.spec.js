'use strict';

describe('Service: userFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var userFactory;
  beforeEach(inject(function (_userFactory_) {
    userFactory = _userFactory_;
  }));

  it('should do something', function () {
    expect(!!userFactory).toBe(true);
  });

});
