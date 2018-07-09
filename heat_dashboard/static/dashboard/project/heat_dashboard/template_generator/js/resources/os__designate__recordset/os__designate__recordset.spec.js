(function() {
    'use strict';

    describe('component os-designate-recordset', function(){

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
            element = $compile(angular.element('<os-designate-recordset recordset="resource"'+
                    'dependson="dependson" connectedoptions="connectedoptions"'+
                    'form-reference="resourceForm"></os-designate-recordset>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title Properties with resource properties set',  function() {
            $scope.resource = { masters: [], attributes: []};
            element = $compile(angular.element('<os-designate-recordset recordset="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-designate-recordset>'))($scope);

            $scope.$digest();

            expect(element.find('span').html()).toContain("Properties");
        });
    });

})();
