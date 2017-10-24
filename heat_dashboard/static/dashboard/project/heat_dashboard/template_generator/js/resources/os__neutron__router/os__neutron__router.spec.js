(function() {
    'use strict';

    describe('component os-neutron-router', function(){

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
                    subnets: [{id: 'subnet1-id', name: 'subnet-id'}]
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-router router="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-neutron-router>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-router router="resource"'+
                    ' dependson="dependson"'+
                    ' form-reference="resourceForm"></os-neutron-router>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with connectedoptions set', function(){
            $scope.resource = {'external_gateway_info.network': 'network-id',
                               'ext_fixed_ips.subnet': ['subnet-id'],}
            $scope.connectedoptions = {'external_gateway_info.network': [{value: 'network-id'}],
                                       'ext_fixed_ips.subnet': [{value: 'subnet-id'}],
                                       };
            element = $compile(angular.element('<os-neutron-router router="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-neutron-router>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('value_spec should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_value_specs();

            expect($scope.resource.value_specs.length).toEqual(2);
        });

        it('value_spec should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_value_specs();

            expect($scope.resource.value_specs.length).toEqual(0);
        });

        it('external_fixed_ip should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_external_fixed_ip();

            expect($scope.resource.external_gateway_info.external_fixed_ips.length).toEqual(2);
        });

        it('external_fixed_ip should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_external_fixed_ip();

            expect($scope.resource.external_gateway_info.external_fixed_ips.length).toEqual(0);
        });

    });

})();
