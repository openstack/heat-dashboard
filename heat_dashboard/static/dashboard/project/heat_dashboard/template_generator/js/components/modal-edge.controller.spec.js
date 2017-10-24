(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.EdgeFormModalController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var hotgenGlobals, hotgenStates, basePath;
        beforeEach(inject(function($injector){
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenStates = $injector.get('hotgenStates');
            basePath = $injector.get('horizon.dashboard.project.heat_dashboard.template_generator.basePath');
        }));

        var $controller, controller, $scope, $rootScope, $mdDialog;

        beforeEach(inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            $mdDialog =  $injector.get('$mdDialog');
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            spyOn($scope, '$on');
            spyOn($mdDialog, 'show');
            spyOn($mdDialog, 'cancel');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.EdgeFormModalController',
                { $scope: $scope, $mdDialog: $mdDialog});

            $mdDialog.show = jasmine.createSpy().and.callFake(function() {
                return {
                    then: (function (callBack) {
                                callBack(true); //return the value to be assigned.
                            }, function(callBack){
                                callBack(false)}
                          )
                    }
            });
            $mdDialog.cancel = jasmine.createSpy().and.callFake(function() {
                return function(callBack){callBack(true)};
            });
        }));

        it('should exist', function(){
            expect(controller).toBeDefined();
        });

        it('$scope.$on should be called', function(){
            var event = $rootScope.$broadcast('handle_edit_edge');

            expect($scope.$on).toHaveBeenCalled();
        });

        it('show dialog with no parameters set.', function(){
            $scope.showTabDialog();
            $scope.$digest();

            expect($mdDialog.show).toHaveBeenCalled();
        });

        it('handle_edit_edge valid edges', function(){
            var event = $rootScope.$broadcast('handle_edit_edge');
            hotgenGlobals.update_edge_directions('from_id', {'to_id': {}});
            hotgenStates.update_saved_dependsons('from_id', 'to_id');

            $scope.handle_edit_edge(event, {
                    'from_type': 'from_type', 'to_type': 'to_type',
                    'from_id': 'from_id', 'to_id': 'to_id',
            });

            expect($mdDialog.show).toHaveBeenCalled();
        });

        it('handle_edit_edge invalid edges #1', function(){
            var event = $rootScope.$broadcast('handle_edit_edge');
            hotgenGlobals.update_edge_directions('from_type', {'to_type': {}})

            expect($mdDialog.show).not.toHaveBeenCalled();

            $scope.handle_edit_edge(event, {
                    'from_type': 'from_type', 'to_type': 'to_type',
                    'from_id': 'from_id', 'to_id': 'to_id',
            });
        });

        it('handle_edit_edge invalid edges #2', function(){
            var event = $rootScope.$broadcast('handle_edit_edge');
            hotgenGlobals.update_edge_directions('from_id', {'to': {}})

            $scope.handle_edit_edge(event, {
                    'from_type': 'from_type', 'to_type': 'to_type',
                    'from_id': 'from_id', 'to_id': 'to_id',
            });

            expect($mdDialog.show).not.toHaveBeenCalled();
        });

        it('cancel dialog', function(){
            hotgenStates.set_selected({
                id: 'edge-id',
                edge: {arrows: {middle: true}},
                resource_type: {from: 'from_type', to: 'to_type'},
                from_node: {id: 'from_id'},
                to_node: {id: 'to_id'}
            });
            hotgenStates.set_saved_resources({
                'edge-id': {data: {'resource property': 'something'}}
            });
            $scope.edgeDialogController($scope, $mdDialog, hotgenStates, basePath);
            $scope.cancel();

            expect($mdDialog.cancel).toHaveBeenCalled();

        });

        it('delete resource dialog', function(){
            hotgenStates.set_selected({
                id: 'edge-id',
                edge: {arrows: {middle: true}},
                resource_type: {from: 'from_type', to: 'to_type'},
                from_node: {id: 'from_id'},
                to_node: {id: 'to_id'}
            });
            hotgenStates.set_saved_resources({
                'edge-id': {data: {'resource property': 'something'}}
            });
            hotgenStates.set_network({
                deleteSelected: function(){}
            });
            $scope.edgeDialogController($scope, $mdDialog, hotgenStates, basePath);
            $scope.delete_resource();

            expect($mdDialog.cancel).toHaveBeenCalled();

        });

        it('handle_edit_edge test depends on edge.', function(){
            hotgenStates.set_selected({
                id: 'edge-id',
                edge: {arrows: {middle: true}},
                resource_type: {from: 'from_type', to: 'to_type'},
                from_node: {id: 'from_id'},
                to_node: {id: 'to_id'}
            });
            hotgenStates.set_saved_resources({
                'edge-id': {data: {'resource property': 'something'}}
            });
            $scope.edgeDialogController($scope, $mdDialog, hotgenStates, basePath);

            expect($scope.is_depends).toEqual(true);
            expect(Object.keys($scope.resource).length).toEqual(1);
            expect($scope.from_node.image).toEqual(basePath+'js/resources/from_type/from_type.svg')
        });

        it('handle_edit_edge test properties edge.', function(){
            hotgenStates.set_selected({
                id: 'edge-id',
                edge: {},
                resource_type: {from: 'from_type', to: 'to_type'},
                from_node: {id: 'from_id'},
                to_node: {id: 'to_id'}
            });
            hotgenStates.set_saved_resources({
                'edge-id': {
                    data: {'resource property': 'something'}
                }
            })
            $scope.edgeDialogController($scope, $mdDialog, hotgenStates, basePath);

            expect($scope.is_depends).toEqual(false);
            expect(Object.keys($scope.resource).length).toEqual(1);
        });

        it('handle_edit_edge test not saved edge.', function (){
            hotgenStates.set_selected({
                id: 'edge-id',
                edge: {},
                resource_type: {from: 'from_type', to: 'to_type'},
                from_node: {id: 'from_id'},
                to_node: {id: 'to_id'}
            });
            hotgenStates.set_saved_resources({
                'node-id': {
                    data: {'resource property': 'something'}
                }
            })
            $scope.edgeDialogController($scope, $mdDialog, hotgenStates, basePath);

            expect(Object.keys($scope.resource).length).toEqual(0)
        });
    });

})();
