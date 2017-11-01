(function() {
    'use strict';

    describe('component os-neutron-floatingip', function(){

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
                    floating_networks: [{id: 'floating-network1-id', name: 'floating-network1-id'}],
                    floating_subnets: [{id: 'floating-subnet1-id', name: 'floating-subnet1-id'}],
                    ports: [{id: 'port1-id', name: 'port1-id'}],
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-floatingip floatingip="resource"'+
                ' dependson="dependson" connectedoptions="connectedoptions"'+
                ' form-reference="resourceForm"></os-neutron-floatingip>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-floatingip floatingip="resource"'+
                ' dependson="dependson"'+
                ' form-reference="resourceForm"></os-neutron-floatingip>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });


        it('find tab title with connectedoptions set',  function() {
            $scope.resource = {floating_network: 'floating-network-id',
                               floating_subnet: 'floating-subnet-id',
                               port_id: 'port_id'}
            $scope.connectedoptions = {floating_network: [{value: 'floating-network-id'}],
                                       floating_subnet: [{value: 'floating-subnet-id'}],
                                       port_id: [{value: 'port-id'}],
                                       };

            element = $compile(angular.element('<os-neutron-floatingip floatingip="resource"'+
                ' dependson="dependson" connectedoptions="connectedoptions"'+
                ' form-reference="resourceForm"></os-neutron-floatingip>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('value_spec should be successfully added',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.add_value_specs();

            expect($scope.resource.value_specs.length).toEqual(2);
        });

        it('value_spec should be successfully deleted',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.delete_value_specs();

            expect($scope.resource.value_specs.length).toEqual(0);
        });
    });

})();
