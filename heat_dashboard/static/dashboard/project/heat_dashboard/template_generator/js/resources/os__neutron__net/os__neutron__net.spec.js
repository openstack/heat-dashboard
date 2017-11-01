(function() {
    'use strict';

    describe('component os-neutron-net', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');
            $scope.resource = {};
            $scope.dependson = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-net network="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-neutron-net>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title Properties with resource properties set',  function() {
            $scope.resource = { tags: [], dhcp_agent_ids: [], admin_state_up: true, value_specs: []};
            element = $compile(angular.element('<os-neutron-net network="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-neutron-net>'))($scope);

            $scope.$digest();

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
    });

})();
