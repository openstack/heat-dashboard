(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.DraftMenuController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $controller, controller, $scope, $rootScope, $mdMenu;

        beforeEach(inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            $mdMenu = $injector.get('$mdMenu');
            spyOn($rootScope, '$broadcast');
            $mdMenu.open = jasmine.createSpy().and.callFake(function() {
                return function (callBack) {
                    callBack(true); //return the value to be assigned.
                }
            });
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.DraftMenuController', { $scope: $scope,});
        }));

        afterEach(function() {
            localStorage.clear();
        });


        it('DraftMenuController should exist', function(){
            expect(controller).toBeDefined();
        });

        it('DraftMenuController basePath', inject([ '$window', function($window){
            expect($scope.basePath).toBe($window.STATIC_URL + 'dashboard/project/heat_dashboard/template_generator/');
        }]));

        it('scope.openMenu ', function(){
            $scope.openMenu($mdMenu, {});

            expect($mdMenu.open).toHaveBeenCalled();
        });

        it('DraftMenuController scope.data contains nodes and edges', function(){
            expect($scope.data.nodes.length).toEqual(0);
            expect($scope.data.edges.length).toEqual(0);
        });

        it('scope.save_draft stores in localStorage', function(){
            expect(localStorage.length).toEqual(0);

            $scope.save_draft();

            expect(localStorage.length).toEqual(0);

            $scope.data.nodes.add({'id': 'some-id'});
            $scope.save_draft();

            expect(localStorage.length).toEqual(2);

            $scope.data.nodes.add({'id': 'some-id-2'});
            $scope.save_draft();

            expect(localStorage.length).toEqual(3);

        });

        it('scope.load_draft', function(){
            $scope.load_draft();

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_load_draft');
        });

        it('scope.import_draft', function(){
            $scope.import_draft();
        });

        it('scope.export_draft', function(){
            $scope.export_draft();
        });
    });

    describe('horizon.dashboard.project.heat_dashboard.template_generator.ClearCanvasController', function(){
      beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $controller, controller, $scope, $rootScope;

        beforeEach(inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            spyOn($rootScope, '$broadcast');
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.ClearCanvasController', { $scope: $scope,});
        }));

        afterEach(function() {
            localStorage.clear();
        });


        it('ClearCanvasController should exist', function(){
            expect(controller).toBeDefined();
        });

        it('ClearCanvasController basePath', inject([ '$window', function($window){
            expect($scope.basePath).toBe($window.STATIC_URL + 'dashboard/project/heat_dashboard/template_generator/');
        }]));

        it('ClearCanvasController scope.data contains nodes and edges', function(){
            expect($scope.data.nodes.length).toEqual(0);
            expect($scope.data.edges.length).toEqual(0);
        });

        it('scope.clear_canvas should empty $scope.data', function(){

            $scope.data.nodes.add({'id': 'some-node-id'});
            $scope.data.edges.add({'id': 'some-edge-id'});

            expect($scope.data.nodes.length).toEqual(1);
            expect($scope.data.edges.length).toEqual(1);

            $scope.clear_canvas();

            expect($scope.data.nodes.length).toEqual(0);
            expect($scope.data.edges.length).toEqual(0);
        });
    });


})();
