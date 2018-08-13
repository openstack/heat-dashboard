(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.IconController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $controller, controller, $scope, hotgenGlobals;

        beforeEach(inject(function($injector){
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenGlobals.update_resource_icons('OS__Project__Resource', '');
            hotgenGlobals.update_resource_icons('OS__Key', '');
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.IconController', { $scope: $scope,});
        }));

        it('should exist', function(){
            expect(controller).toBeDefined();
        });

        it('check scope parameters', inject([ '$window', function($window){
            var icons_number = Object.keys(hotgenGlobals.get_resource_icons()).length;

            expect(Object.keys($scope.resource_types).length).toEqual(icons_number);

            var admin_number = Object.keys(hotgenGlobals.get_node_admin()).length;

            expect(Object.keys($scope.resource_admin).length).toEqual(admin_number);
            expect($scope.admin).toEqual(false);
            expect($scope.basePath).toBe($window.STATIC_URL + 'dashboard/project/heat_dashboard/template_generator/');

        }]));

    });

})();
