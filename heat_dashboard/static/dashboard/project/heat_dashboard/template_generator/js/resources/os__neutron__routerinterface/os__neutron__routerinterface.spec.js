(function() {
    'use strict';

    describe('component os-neutron-routerinterface', function(){

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
                    routers: [{id: 'router1-id', name: 'router1-id'}],
                    subnets: [{id: 'subnet1-id', name: 'subnet1-id'}],
                    ports: [{id: 'port1-id', name: 'port1-id'}],
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-neutron-router-interface'+
                    ' routerinterface="resource" dependson="dependson"'+
                    ' connectedoptions="connectedoptions" form-reference="resourceForm">'+
                    '</os-neutron-router-interface>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-neutron-router-interface'+
                    ' routerinterface="resource" dependson="dependson"'+
                    ' form-reference="resourceForm">'+
                    '</os-neutron-router-interface>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with connectedoptions set', function(){
            $scope.resource = {port: 'port-id',
                               subnet: 'subnet-id',
                               router: 'router-id'}
            $scope.connectedoptions = {port: [{value: 'port-id'}],
                                       subnet: [{value: 'subnet-id'}],
                                       router: [{value: 'router-id'}],
                                       };
            element = $compile(angular.element('<os-neutron-router-interface'+
                    ' routerinterface="resource" dependson="dependson"'+
                    ' connectedoptions="connectedoptions" form-reference="resourceForm">'+
                    '</os-neutron-router-interface>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });
    });

})();
