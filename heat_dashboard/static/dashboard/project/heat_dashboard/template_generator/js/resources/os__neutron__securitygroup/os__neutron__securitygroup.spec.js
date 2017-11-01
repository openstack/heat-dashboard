(function() {
    'use strict';

    describe('component os-neutron-security-group', function(){

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
            element = $compile(angular.element('<os-neutron-security-group '+
                    'securitygroup="resource" dependson="dependson" '+
                    'form-reference="resourceForm"></os-neutron-security-group>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title Properties with rules undefined',  function() {
            $scope.resource = {rules: []}
            element = $compile(angular.element('<os-neutron-security-group '+
                    'securitygroup="resource" dependson="dependson" '+
                    'form-reference="resourceForm"></os-neutron-security-group>'))($scope);
            $scope.$digest();
            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('rules should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_rule();

            expect($scope.resource.rules.length).toEqual(2);
        });

        it('rules should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_rule();

            expect($scope.resource.rules.length).toEqual(0);
        });
    });

})();
