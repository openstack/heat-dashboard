(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.TempModalController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var hotgenGlobals, hotgenStates, hotgenNotify, basePath, projectPath;
        beforeEach(inject(function($injector){
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenStates = $injector.get('hotgenStates');
            hotgenNotify = $injector.get('hotgenNotify');
            basePath = $injector.get('horizon.dashboard.project.heat_dashboard.template_generator.basePath');
            projectPath = $injector.get('horizon.dashboard.project.heat_dashboard.template_generator.projectPath');
        }));

        var $controller, controller, $scope, $rootScope, $mdDialog;

        beforeEach(inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            $mdDialog =  $injector.get('$mdDialog');
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            spyOn($mdDialog, 'show');
            spyOn($mdDialog, 'cancel');
            spyOn(hotgenNotify, 'show_success');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.TempModalController',
                { $scope: $scope, $mdDialog: $mdDialog});

            $mdDialog.show = jasmine.createSpy().and.callFake(function() {
                return {
                    then: (function (callBack) {
                                callBack(true); //return the value to be assigned.
                            }, function(callBack){
                                callBack(false)}
                          )
                    }
            });
            $mdDialog.cancel = jasmine.createSpy().and.callFake(function() {
                return function(callBack){callBack(true)};
            });
        }));

        it('should exist', function(){
            expect(controller).toBeDefined();
            expect($mdDialog).toBeDefined();
        });

        it('$scope.open', function(){
            $scope.open();

            expect($mdDialog.show).not.toHaveBeenCalled();

            hotgenGlobals.set_template_version('2017-09-01.template');
            $scope.open();

            expect($mdDialog.show).toHaveBeenCalled();
        });

        it('$scope.dialogController', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);

            expect($scope.all_saved).toEqual(false);
        });

        it('$scope.dialogController $cancel', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            $scope.cancel();

            expect($mdDialog.cancel).toHaveBeenCalled();
        });

        it('$scope.dialogController download', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            $scope.download();

            expect(hotgenNotify.show_success).toHaveBeenCalled();
        });

        it('$scope.dialogController save', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);

            $scope.redirect = jasmine.createSpy().and.callFake(function() {
                return function(){return true};
            });
            $scope.save();

            expect($scope.redirect).toHaveBeenCalled();
        });

        it('$scope.dialogController extract_properties', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            var to_extract = {
                description: '', public_key: '',
                metadata: '', scheduler_hints: '', value_specs: '',
                allocation_pools: '', allowed_address_pairs: '', block_device_mapping: '',
                block_device_mapping_v2: '', fixed_ips: '', host_routes: '',
                personality: '',
                rules: '', dns_nameservers: '', dhcp_agent_ids: '', tags: '',
                resource_def: '',
                others: ''
            }
            var resource_data = $scope.extract_properties(to_extract);

            expect(Object.keys(resource_data).length).toEqual(2);
        });

        it('$scope.dialogController generate', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            hotgenStates.update_saved_resources('node_id', {
               type: 'Node_Type',
               data: { description: '', public_key: '',
                metadata: '', scheduler_hints: '', value_specs: '',
                allocation_pools: '', allowed_address_pairs: '', block_device_mapping: '',
                block_device_mapping_v2: '', fixed_ips: '', host_routes: '',
                personality: '',
                rules: '', dns_nameservers: '', dhcp_agent_ids: '', tags: '',
                resource_def: '',
                others: ''}
            });
            hotgenStates.set_saved_flags({'node_id': true});
            hotgenStates.update_saved_dependsons('node_id', ['depend_on_id']);
            hotgenStates.set_incremented_label('depend_on_id', 'depend_on_label');
            hotgenGlobals.set_resource_outputs('Node_Type', {'property': 'public_key'});
            hotgenGlobals.set_template_version('2017-09-01.template');
            var yamlstring = $scope.generate();

            expect(yamlstring.length).toBeGreaterThan(0);
        });


        it('$scope.dialogController trivial generate', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            hotgenStates.update_saved_resources('node_id', {
               type: 'Node_Type',
               data: {metadata: ''}
            });
            hotgenStates.set_saved_flags({'node_id': true});
            hotgenGlobals.set_template_version('2017-09-01.template');
            var yamlstring = $scope.generate();

            expect(yamlstring.length).toBeGreaterThan(0);
        });

        it('$scope.dialogController trivial dependson generate', function(){
            $scope.dialogController($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify);
            hotgenStates.update_saved_resources('node_id', {
               type: 'Node_Type',
               data: {metadata: ''}
            });
            hotgenStates.set_saved_flags({'node_id': true});
            hotgenStates.update_saved_dependsons('node_id', []);
            hotgenGlobals.set_template_version('2017-09-01.template');
            var yamlstring = $scope.generate();

            expect(yamlstring.length).toBeGreaterThan(0);
        });
    });
})();
