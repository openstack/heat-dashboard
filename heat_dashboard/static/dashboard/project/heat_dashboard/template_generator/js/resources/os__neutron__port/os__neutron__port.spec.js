(function() {
    'use strict';

    describe('component os-neutron-port', function(){

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
                    security_groups: [{id: 'secgroup1-id', name: 'secgroup1-id'}],
                    subnets: [{id: 'subnet1-id', name: 'subnet-id'}]
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-port port="resource" '+
                'dependson="dependson" connectedoptions="connectedoptions" '+
                'form-reference="resourceForm"></os-neutron-port>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-port port="resource" '+
                'dependson="dependson" '+
                'form-reference="resourceForm"></os-neutron-port>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });


        it('find tab title with connectedoptions set',  function() {
            $scope.resource = {device_owner: 'someone',
                               network: 'network-id',
                               security_groups: ['secgroup-id'],
                               'fixed_ips.subnet': ['subnet-id'],}
            $scope.connectedoptions = {network: [{value: 'network-id'}],
                                       security_groups: [{value: 'secgroup-id'}],
                                       'fixed_ips.subnet': [{value: 'subnet-id'}],
                                       };

            element = $compile(angular.element('<os-neutron-port port="resource" '+
                'dependson="dependson" connectedoptions="connectedoptions" '+
                'form-reference="resourceForm"></os-neutron-port>'))($scope);

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

        it('allowed address pair should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_allowed_address_pair();

            expect($scope.resource.allowed_address_pairs.length).toEqual(2);
        });

        it('allowed address pair should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_allowed_address_pair();

            expect($scope.resource.allowed_address_pairs.length).toEqual(0);
        });

        it('fixed_ip should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_fixed_ip();

            expect($scope.resource.fixed_ips.length).toEqual(2);
        });

        it('fixed_ip should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_fixed_ip();

            expect($scope.resource.fixed_ips.length).toEqual(0);
        });

        it('searchTextChange set device_owner', function(){
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.searchTextChange('device_owner_01');

            expect($scope.resource.device_owner).toEqual('device_owner_01');
        });

        it('selectedItemChange set device_owner', function(){
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.selectedItemChange({display: 'device_owner_01'});

            expect($scope.resource.device_owner).toEqual('device_owner_01');
        });

        it('querySearch set device_owner', function(){
            var $ctrl = $isolateScope.$ctrl;
            var retValue = $ctrl.querySearch('');

            expect(retValue.length).toEqual(3);

            retValue = $ctrl.querySearch('network:dhcp');

            expect(retValue).toEqual([ { value: 'network_dhcp', display: 'network:dhcp' }]);
        });
    });

})();
