'use strict';

describe('Service: notificationFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var notificationFactory;
  beforeEach(inject(function (_notificationFactory_) {
    notificationFactory = _notificationFactory_;
  }));

  it('should do something', function () {
    expect(!!notificationFactory).toBe(true);
  });

});
