(function() {
    'use strict';

    describe('component os-designate-zone', function(){

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
            element = $compile(angular.element('<os-designate-zone zone="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-designate-zone>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title Properties with resource properties set',  function() {
            $scope.resource = { masters: [], attributes: []};
            element = $compile(angular.element('<os-designate-zone zone="resource" '+
                    'dependson="dependson" form-reference="resourceForm">'+
                    '</os-designate-zone>'))($scope);

            $scope.$digest();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('test validate master function', function() {
            expect($isolateScope.validate_master('192.168.1.1')).toEqual('192.168.1.1');
            expect($isolateScope.validate_master('localhost')).toEqual('localhost');
            expect($isolateScope.validate_master('xxx@gmail.com')).toEqual(null);
        });
    });

})();
