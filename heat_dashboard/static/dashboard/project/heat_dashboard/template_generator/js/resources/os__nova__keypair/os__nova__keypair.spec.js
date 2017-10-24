(function() {
    'use strict';

    describe('component os-nova-keypair', function(){

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

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-nova-keypair keypair="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-nova-keypair>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

    });

})();
