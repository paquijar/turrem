'use strict';

describe('Controller: HelloCtrl', function () {

  // load the controller's module
  beforeEach(module('webPagesApp'));

  var HelloCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HelloCtrl = $controller('HelloCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(HelloCtrl.awesomeThings.length).toBe(3);
  });
});
