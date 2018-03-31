'use strict';

describe('Service: transactionFactory', function () {

  // load the service's module
  beforeEach(module('takhshilaApp'));

  // instantiate service
  var transactionFactory;
  beforeEach(inject(function (_transactionFactory_) {
    transactionFactory = _transactionFactory_;
  }));

  it('should do something', function () {
    expect(!!transactionFactory).toBe(true);
  });

});
