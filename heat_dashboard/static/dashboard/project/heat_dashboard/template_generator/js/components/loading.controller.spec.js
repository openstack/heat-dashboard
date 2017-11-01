(function() {
    'use strict';
    describe('LoadingController', function(){
        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $controller, controller, $scope, $rootScope;

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.LoadingController', { $scope: $scope,});
        }));

        beforeEach(inject(function(_$rootScope_) {
          $rootScope = _$rootScope_;
        }));

        it('should exist', function(){
            expect(controller).toBeDefined();
        });

        it('loading is false by default', function(){
            expect($scope.loading).toEqual(true);
        });

        it('loading is true after message received', function(){
            $rootScope.$broadcast('handle_resources_loaded');

            expect($scope.loading).toEqual(false);

        });

    });


})();
