(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', function(){
        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $httpBackend, requestHandler;
        var $location;
        var hotgenGlobals;

        beforeEach(inject(function($injector){
            $location = $injector.get('$location');
            hotgenGlobals = $injector.get('hotgenGlobals');
            spyOn($location, 'absUrl').and.callFake(function (p) {
                return 'http://some-url/';
            });
        }));

        beforeEach(inject(function($injector) {
            // Set up the mock http service responses
            $httpBackend = $injector.get('$httpBackend');
            requestHandler = $httpBackend.when('GET', 'http://some-url/get_resource_options')
                                .respond(200, {
                                        'auth': {
                                            'tenant_id': 'tenant-id',
                                            'admin': false,
                                        },
                                        'template_versions': [
                                            {'name': 'v1', 'id': 'v1'},
                                            {'name': 'v2', 'id': 'v2'}
                                        ],
                                    }
                                );


        }));

        var $controller, controller, $scope;
        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should exist', function(){
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', { $scope: $scope,});

            expect(controller).toBeDefined();

            $httpBackend.flush();
        });

        it('should return array with 2 items', function(){
            $httpBackend.expectGET('http://some-url/get_resource_options');

            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', { $scope: $scope,});
            $httpBackend.flush();

            expect($scope.template_versions.length).toEqual(2);

        });

        it('should return empty array', function(){
            requestHandler.respond(500, '');
            $httpBackend.expectGET('http://some-url/get_resource_options');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', { $scope: $scope,});
            $httpBackend.flush();

            expect($scope.template_versions.length).toEqual(0);

        });

        it('should return true', function(){
            $httpBackend.expectGET('http://some-url/get_resource_options');

            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', { $scope: $scope,});
            $httpBackend.flush();

            expect($scope.update_template_version()).toEqual(true);

        });

        it('should set template version from hotgenGlobals', function(){
            $httpBackend.expectGET('http://some-url/get_resource_options');

            hotgenGlobals.set_template_version('template_version-1');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentController', { $scope: $scope,});
            $httpBackend.flush();

            $scope.load_template_version();
            
            expect($scope.template_version).toEqual('template_version-1');
        });
    });

})();
