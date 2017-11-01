(function() {
    'use strict';

    describe('component os-neutron-subnet', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var hotgenGlobals;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenGlobals.update_resource_options({
                    networks: [{id: 'network1-id', name: 'network1-id'}],
            });

            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-subnet subnet="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-neutron-subnet>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-subnet subnet="resource"'+
                    ' dependson="dependson"'+
                    ' form-reference="resourceForm"></os-neutron-subnet>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with connectedoptions set', function(){
            $scope.resource = {network: 'network-id',}
            $scope.connectedoptions = {network: [{value: 'network-id'}]};
            element = $compile(angular.element('<os-neutron-subnet subnet="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-neutron-subnet>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('allocation_pool should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_allocation_pool();

            expect($scope.resource.allocation_pools.length).toEqual(2);
        });

        it('allocation_pool should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_allocation_pool();

            expect($scope.resource.allocation_pools.length).toEqual(0);
        });

        it('hostroute should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_hostroute();

            expect($scope.resource.host_routes.length).toEqual(2);
        });

        it('hostroute should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_hostroute();

            expect($scope.resource.host_routes.length).toEqual(0);
        });

        it('validate dns',  function() {
            expect( $isolateScope.validate_dns('@')).toEqual(null);
            expect( $isolateScope.validate_dns('8.8.8.8')).toEqual('8.8.8.8');
        });
    });

})();
