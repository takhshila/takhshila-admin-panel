'use strict';

describe('Service: videoFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var videoFactory;
  beforeEach(inject(function (_videoFactory_) {
    videoFactory = _videoFactory_;
  }));

  it('should do something', function () {
    expect(!!videoFactory).toBe(true);
  });

});
