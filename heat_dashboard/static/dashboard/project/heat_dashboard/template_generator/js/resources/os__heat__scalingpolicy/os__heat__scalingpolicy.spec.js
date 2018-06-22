(function() {
    'use strict';

    describe('component os-heat-scalingpolicy', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var hotgenGlobals;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');

            $scope.resource = {};
            $scope.dependson = [];
            $scope.resourceForm = {};
            $scope.connectedoptions = [];

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-heat-scalingpolicy scalingpolicy="resource" '+
                    'dependson="dependson" connectedoptions="connectedoptions" '+
                    'form-reference="resourceForm">'+
                    '</os-heat-scalingpolicy>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with connectedoptions set',  function() {
            $scope.resource = {auto_scaling_group_id: 'auto-scaling-group-uuid'}
            $scope.connectedoptions = {auto_scaling_group_id: [{value: 'auto-scaling-group-uuid'}],
                                       };

            element = $compile(angular.element('<os-heat-scalingpolicy scalingpolicy="resource" '+
                    'dependson="dependson" connectedoptions="connectedoptions" '+
                    'form-reference="resourceForm">'+
                    '</os-heat-scalingpolicy>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
            expect($isolateScope.$ctrl.scalingpolicy.auto_scaling_group_id).toEqual('auto-scaling-group-uuid');
        });

        it('find tab title with auto_scaling_group_id set',  function() {
            $scope.resource = {auto_scaling_group_id: '{ get_resource: AutoScalingGroup_1 }'}

            element = $compile(angular.element('<os-heat-scalingpolicy scalingpolicy="resource" '+
                    'dependson="dependson" connectedoptions="connectedoptions" '+
                    'form-reference="resourceForm">'+
                    '</os-heat-scalingpolicy>'))($scope);

            $scope.$digest();
            $isolateScope = element.isolateScope();
            expect(element.find('span').html()).toContain("Properties");
            expect($isolateScope.$ctrl.scalingpolicy.auto_scaling_group_id).toEqual('');
        });

        it('find tab title with adjustment type set',  function() {
            $scope.resource = {adjustment_type: 'percent_change_in_capacity'}
            element = $compile(angular.element('<os-heat-scalingpolicy scalingpolicy="resource" '+
                    'dependson="dependson" connectedoptions="connectedoptions" '+
                    'form-reference="resourceForm">'+
                    '</os-heat-scalingpolicy>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();
            expect(element.find('span').html()).toContain("Properties");

            $scope.resource = {adjustment_type: 'change_in_capacity'}
            element = $compile(angular.element('<os-heat-scalingpolicy scalingpolicy="resource" '+
                    'dependson="dependson" connectedoptions="connectedoptions" '+
                    'form-reference="resourceForm">'+
                    '</os-heat-scalingpolicy>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();
            expect(element.find('span').html()).toContain("Properties");

        });
    });

})();
