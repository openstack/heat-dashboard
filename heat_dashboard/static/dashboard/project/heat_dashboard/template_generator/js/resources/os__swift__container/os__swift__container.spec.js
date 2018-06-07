(function() {
    'use strict';

    describe('component os-swift-container', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');

            $scope.resource = {};
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-swift-container container="resource"'+
                ' form-reference="resourceForm"></os-swift-container>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with resource set',  function() {
            $scope.resource = {metadata: [], scheduler_hints:[]};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-swift-container container="resource"'+
                ' form-reference="resourceForm"></os-swift-container>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        // X-Container-Meta
        it('x-container-meta should be successfully added',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.add_x_container_meta();

            expect($scope.resource['X-Container-Meta'].length).toEqual(2);
        });

        it('x-container-meta should be successfully deleted',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.delete_x_container_meta();

            expect($scope.resource['X-Container-Meta'].length).toEqual(0);
        });

        // X-Account-Meta
        it('x-account-meta should be successfully added',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.add_x_account_meta();

            expect($scope.resource['X-Account-Meta'].length).toEqual(2);
        });

        it('x-account-meta should be successfully deleted',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.delete_x_account_meta();

            expect($scope.resource['X-Account-Meta'].length).toEqual(0);
        });

    });
})();
