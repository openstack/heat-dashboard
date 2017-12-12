(function () {
  'use strict';

  describe('hotgen-agent module', function () {
    it('should be defined', function () {
      expect(angular.module('hotgen-agent')).toBeDefined();
    });
  });

  describe('hotgen-utils.hotgenStates', function(){
    beforeEach(module('hotgen-agent'));

    var hotgenAgent;

    beforeEach(inject(function(_hotgenAgent_){
        hotgenAgent = _hotgenAgent_;
    }));

    var $httpBackend, requestHandler;
    var $location;

    beforeEach(inject(function($injector){
        $location = $injector.get('$location');
    }));

    beforeEach(inject(function($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        requestHandler = $httpBackend.when('GET', 'http://some-url/get_resource_options')
                            .respond(200, {
                                    'auth': {
                                        'tenant_id': 'tenant-id',
                                        'admin': false,
                                    }}
                            );


    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should exist', function(){
        expect(hotgenAgent).toBeDefined();
    });

    it('should return get_resource_options', function(){
        spyOn($location, 'absUrl').and.callFake(function (p) {
            return 'http://some-url/';
        });
        $httpBackend.expectGET('http://some-url/get_resource_options');
        var optionsPromise = hotgenAgent.get_resource_options();
        optionsPromise.then(function(options){
            expect(options.auth.tenant_id).toEqual('tenant-id');
            expect(options.auth.admin).toEqual(false);
        });
        $httpBackend.flush();

    });

    it('should return get_resource_options with errors', function(){
        spyOn($location, 'absUrl').and.callFake(function (p) {
            return 'http://some-url/';
        });
        requestHandler.respond(200, {
                               'auth': {
                                   'tenant_id': 'tenant-id',
                                   'admin': false,
                               },'errors': {'a': 'b'}}
                       );
        $httpBackend.expectGET('http://some-url/get_resource_options');
        var optionsPromise = hotgenAgent.get_resource_options();
        optionsPromise.then(function(options){
            expect(options.auth.tenant_id).toEqual('tenant-id');
            expect(options.auth.admin).toEqual(false);
        });
        $httpBackend.flush();

    });

    it('should return error', function(){
        spyOn($location, 'absUrl').and.callFake(function (p) {
            return 'http://some-url';
        });
        requestHandler.respond(500, '');

        $httpBackend.expectGET('http://some-url/get_resource_options');

        var optionsPromise = hotgenAgent.get_resource_options();
        optionsPromise.then(function(options){
            expect(options).toEqual(null);
        });
        $httpBackend.flush();

    });


  });

})();
