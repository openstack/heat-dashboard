(function() {
    'use strict';

    describe('os-neutron-floatingip-association', function(){

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
                    floatingips: [{id: 'floatingip1-id', name: 'floatingip1-id'}],
                    ports: [{id: 'port1-id', name: 'port1-id'}],
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-floatingip-association'+
                ' floatingipassociation="resource" dependson="dependson" '+
                'connectedoptions="connectedoptions" form-reference="resourceForm">'+
                '</os-neutron-floatingip-association>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-floatingip-association'+
                ' floatingipassociation="resource" dependson="dependson" '+
                ' form-reference="resourceForm">'+
                '</os-neutron-floatingip-association>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });


        it('find tab title with connectedoptions set',  function() {
            $scope.resource = {floatingip_id: 'floatingip-id',
                               port_id: 'port_id'}
            $scope.connectedoptions = {floatingip_id: [{value: 'floatingip-id'}],
                                       port_id: [{value: 'port-id'}],
                                       };

            element = $compile(angular.element('<os-neutron-floatingip-association'+
                ' floatingipassociation="resource" dependson="dependson" '+
                'connectedoptions="connectedoptions" form-reference="resourceForm">'+
                '</os-neutron-floatingip-association>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });
    });

})();
