(function() {
    'use strict';

    describe('component os-cinder-volume', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');

            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-cinder-volume volume="resource"'+
                ' dependson="dependson" connectedoptions="connectedoptions"'+
                ' form-reference="resourceForm"></os-cinder-volume>'))($scope);

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
            element = $compile(angular.element('<os-cinder-volume volume="resource"'+
                ' dependson="dependson" connectedoptions="connectedoptions"'+
                ' form-reference="resourceForm"></os-cinder-volume>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('metadata should be successfully added',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.add_metadata();

            expect($scope.resource.metadata.length).toEqual(2);
        });

        it('metadata should be successfully deleted',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.delete_metadata();

            expect($scope.resource.metadata.length).toEqual(0);
        });

        it('scheduler_hints should be successfully added',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.add_scheduler_hints();

            expect($scope.resource.scheduler_hints.length).toEqual(2);
        });

        it('scheduler_hints should be successfully deleted',  function() {
            var $ctrl = element.isolateScope().$ctrl;
            $ctrl.delete_scheduler_hints();

            expect($scope.resource.scheduler_hints.length).toEqual(0);
        });

    });

})();
