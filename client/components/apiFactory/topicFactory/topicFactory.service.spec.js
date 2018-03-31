'use strict';

describe('Service: topicFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var topicFactory;
  beforeEach(inject(function (_topicFactory_) {
    topicFactory = _topicFactory_;
  }));

  it('should do something', function () {
    expect(!!topicFactory).toBe(true);
  });

});
