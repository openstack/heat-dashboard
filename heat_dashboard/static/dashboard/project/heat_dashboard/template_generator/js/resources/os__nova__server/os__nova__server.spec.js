(function() {
    'use strict';

    describe('component os-nova-server', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var hotgenGlobals, hotgenUtils;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenUtils = $injector.get('hotgenUtils');
            hotgenGlobals.update_resource_options({
                    networks: [{id: 'network1-id', name: 'network1-id'}],
                    subnets: [{id: 'subnet1-id', name: 'subnet1-id'}],
                    ports: [{id: 'port1-id', name: 'port1-id'}],
                    volumes: [{id: 'volume1-id', name: 'volume1-id'}],
                    floatingips: [{id: 'ipaddress', name: 'ipaddress'}],
                    security_groups: [{id: 'secgroup-id1', name: 'secgroup-id1'}],
                    keypairs: [{id: 'keyname1', name: 'keyname1'}],
            });

            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with connectedoptions set', function(){
            $scope.resource = {image: 'image-id', key_name: 'keyname',
                    security_groups: ['secgroup-01'],
                    block_device_mapping_v2: [
                        {volume_id: '{ get_resource: vol01 }'},
                        {image: 'image-id'}, {image: '{ get_resource: image01 }'},
                        {snapshot_id: 'snapshot-id'},
                        {ignore: 'ignore'}
                    ],
                    networks: [{network: '{ get_resource: network01 }'},
                        {subnet: '{ get_resource: subnet01 }'},
                        {port: '{ get_resource: port01 }'},
                        {floating_ip: '{ get_resource: floatingip01 }'},
                        {ignore: 'ignore'}
                    ],
            }
            $scope.connectedoptions = {
                'networks.network': [{value: 'network-id'}, {value: '{ get_resource: network01 }'}],
                'networks.subnet': [{value: 'subnet-id'}, {value: '{ get_resource: subnet01 }'}],
                'networks.port': [{value: 'port-id'}, {value: '{ get_resource: port01 }'}],
                'networks.floating_ip': [{value: 'floatingip'}, {value: '{ get_resource: floatingip01 }'}],
                key_name: 'keyname',
                security_groups: [{value: 'secgroup-id'}],
                'block_device_mapping_v2.volume_id': [{value: 'volume-id'},
                    {value: '{ get_resource: vol01 }'}],
            }
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            $isolateScope.update_boot_source();
            for (var i in $scope.resource.block_device_mapping_v2){
                $isolateScope.update_source(i);
            }
            for (var i in $scope.resource.networks){
                $isolateScope.update_nwconfig(i);
            }

            expect(element.find('span').html()).toContain("Basic");
        });


        it('find tab title with connectedoptions set with error', function(){
            $scope.resource = {image: 'image-id', key_name: 'keyname',
                    security_groups: ['secgroup-01'],
                    block_device_mapping_v2: [
                        {volume_id: '{ get_resource: vol01 }'},
                        {image: 'image-id'}, {image: '{ get_resource: image01 }'},
                        {snapshot_id: 'snapshot-id'},
                        {ignore: 'ignore'}
                    ],
                    networks: [{network: '{ get_resource: network01 }'},
                        {subnet: '{ get_resource: subnet01 }'},
                        {port: '{ get_resource: port01 }'},
                        {floating_ip: '{ get_resource: floatingip01 }'}
                    ],
            }
            $scope.connectedoptions = {
                'networks.network': [{value: 'network-id'}, {value: '{ get_resource: network01 }'}],
                'networks.subnet': [{value: 'subnet-id'}, {value: '{ get_resource: subnet01 }'}],
                'networks.port': [{value: 'port-id'}, {value: '{ get_resource: port01 }'}],
                'networks.floating_ip': [{value: 'floatingip'}, {value: '{ get_resource: floatingip01 }'}],
                key_name: 'keyname',
                security_groups: [{value: 'secgroup-id'}],
                'block_device_mapping_v2.volume_id': [{value: 'volume-id'},
                    {value: '{ get_resource: vol01 }'}],
            }
            spyOn(hotgenUtils, 'filter_and_return_get_resource_element').and.callFake(function(){
                return [{}]
            });
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with boot from image snapshot', function(){
            $scope.resource = {image_snapshot: 'image-id'}
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            $isolateScope.update_boot_source();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with boot from volume ', function(){
            $scope.resource = {volume: 'vol-id'}
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            $isolateScope.update_boot_source();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with boot from volume snapshot', function(){
            $scope.resource = {volume_snapshot: 'vol-id'}
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            $isolateScope.update_boot_source();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('find tab title with boot from nothing ', function(){
            $scope.resource = {ignore: 'nothing'}
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            $isolateScope.update_boot_source();

            expect(element.find('span').html()).toContain("Basic");
        });

        it('$scope.show_passwd should be successfully watched',  function() {
            $isolateScope.show_passwd = true;
            $isolateScope.$digest();

            expect($isolateScope.show_passwd_type).toEqual('text');

            $isolateScope.show_passwd = false;
            $isolateScope.$digest();

            expect($isolateScope.show_passwd_type).toEqual('password');
        });

        it('metadata should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_metadata();

            expect($scope.resource.metadata.length).toEqual(2);
        });

        it('metadata should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_metadata();

            expect($scope.resource.metadata.length).toEqual(0);
        });

        it('personality should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_personality();

            expect($scope.resource.personality.length).toEqual(2);
        });

        it('personality should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_personality();

            expect($scope.resource.personality.length).toEqual(0);
        });

        it('block_device_mapping should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_block_device_mapping();

            expect($scope.resource.block_device_mapping.length).toEqual(1);
        });

        it('block_device_mapping should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_block_device_mapping();
            $ctrl.delete_block_device_mapping(0);

            expect($scope.resource.block_device_mapping.length).toEqual(0);
        });

        it('block_device_mapping_v2 should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_block_device_mapping_v2();

            expect($scope.resource.block_device_mapping_v2.length).toEqual(1);
        });

        it('block_device_mapping_v2 should be successfully deleted',  function() {
            $scope.resource = {block_device_mapping_v2: [{volume_id: 'vol-01'}]}
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_block_device_mapping_v2(0);

            expect($scope.resource.block_device_mapping_v2.length).toEqual(0);
        });

        it('networks should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_networks();

            expect($scope.resource.networks.length).toEqual(1);
        });

        it('networks should be successfully deleted',  function() {
            $scope.resource = {networks: [{network: 'network-01'}]};
            element = $compile(angular.element('<os-nova-server instance="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-nova-server>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();

            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_networks(0);

            expect($scope.resource.networks.length).toEqual(0);
        });

        it('scheduler_hints should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_scheduler_hints();

            expect($scope.resource.scheduler_hints.length).toEqual(2);
        });

        it('scheduler_hints should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_scheduler_hints();

            expect($scope.resource.scheduler_hints.length).toEqual(0);
        });
    });

})();
