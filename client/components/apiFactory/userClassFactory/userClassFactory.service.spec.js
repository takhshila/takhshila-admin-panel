'use strict';

describe('Service: userClassFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var userClassFactory;
  beforeEach(inject(function (_userClassFactory_) {
    userClassFactory = _userClassFactory_;
  }));

  it('should do something', function () {
    expect(!!userClassFactory).toBe(true);
  });

});
