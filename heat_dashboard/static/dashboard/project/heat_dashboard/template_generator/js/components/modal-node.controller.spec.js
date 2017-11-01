(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.FormModalController', function(){

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
            spyOn($mdDialog, 'hide');
            spyOn($mdDialog, 'cancel');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.FormModalController',
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
            var event = $rootScope.$broadcast('handle_edit_node');

            expect($scope.$on).toHaveBeenCalled();
        });

        it('$scope.handle_edit_node', function(){
            var event = $rootScope.$broadcast('handle_edit_node');
            spyOn($scope, 'showTabDialog');
            $scope.handle_edit_node(event, 'OS__Project__ResourceType');

            expect($scope.showTabDialog).toHaveBeenCalled();
        });

        it('show dialog with no parameters set.', function(){
            $scope.showTabDialog();
            $scope.$digest();

            expect($mdDialog.show).toHaveBeenCalled();
        });

        it('cancel dialog', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1'}
            var to_node = {id: 'to_node_id', label: 'ToNode_1', title: 'ToType_1'}
            var edge1 = {id: 'edge_id_1', from: 'node_id', to: 'to_node_id'}
            var edge2 = {id: 'edge_id_2', from: 'from_node_id', to: 'node_id'}
            hotgenStates.set_selected({
                id: node.id,
                node: node,
                resource_type: node.title,
            });
            var network = {getConnectedEdges: function(data){
                return [edge1.id, edge2.id];
            }}
            hotgenStates.set_network(network);
            $scope.data.nodes.add(node);
            $scope.data.edges.add(edge1);
            $scope.data.edges.add(edge2);

            $scope.dialogController($scope, $mdDialog, hotgenStates);
            $scope.cancel();

            expect($mdDialog.cancel).toHaveBeenCalled();

        });

        it('get label', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1'}
            var to_node = {id: 'to_node_id', label: 'ToNode_1', title: 'ToType_1'}
            var edge1 = {id: 'edge_id_1', from: 'node_id', to: 'to_node_id'}
            var edge2 = {id: 'edge_id_2', from: 'from_node_id', to: 'node_id'}
            hotgenStates.set_selected({
                id: node.id,
                node: node,
                resource_type: node.title,
            });
            var network = {getConnectedEdges: function(data){
                return [edge1.id, edge2.id];
            }}
            hotgenStates.set_network(network);
            $scope.data.nodes.add(node);
            $scope.data.edges.add(edge1);
            $scope.data.edges.add(edge2);
            hotgenGlobals.update_node_labels(node.title, node.label)

            $scope.dialogController($scope, $mdDialog, hotgenStates);
            var nodelabel = $scope.get_label('NodeType_1');

            expect(nodelabel).toEqual(node.label);

        });

        it('delete resource', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1'}
            var to_node = {id: 'to_node_id', label: 'ToNode_1', title: 'ToType_1'}
            var edge1 = {id: 'edge_id_1', from: 'node_id', to: 'to_node_id'}
            var edge2 = {id: 'edge_id_2', from: 'from_node_id', to: 'node_id'}
            hotgenStates.set_selected({
                id: node.id,
                node: node,
                resource_type: node.title,
            });
            var network = {
                deleteSelected: function(){
                    return true;
                },
                getConnectedEdges: function(data){
                    return [edge1.id, edge2.id];
                }
            };
            hotgenStates.set_network(network);
            $scope.data.nodes.add(node);
            $scope.data.edges.add(edge1);
            $scope.data.edges.add(edge2);

            $scope.dialogController($scope, $mdDialog, hotgenStates);
            $scope.delete_resource();

            expect($mdDialog.cancel).toHaveBeenCalled();

        });

        it('save without depends_on', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1', image: 'image-gray.svg'}
            hotgenStates.set_selected({
                id: 'node_id',
                node: node,
                resource_type: 'NodeType_1',
            });
            var network = {
                deleteSelected: function(){
                    return true;
                },
                getConnectedEdges: function(data){
                    return [];
                }
            };
            $scope.data.nodes.add(node);
            hotgenGlobals.update_node_labels(node.id, node.label);
            hotgenStates.set_incremented_label(node.id, node.label);
            hotgenStates.set_network(network);
            $scope.dialogController($scope, $mdDialog, hotgenStates);
            $scope.dependson = [];
            var returnValue = $scope.save();

            expect($mdDialog.hide).toHaveBeenCalled();
            expect(returnValue).toEqual(true);
        });

        it('save with depends_on', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1', icon: {color: '#000'},
                        shape: 'icon', image: 'image-gray.svg'}
            var depend_node = {id: 'depend_node_id', label: 'Node_2', title: 'NodeType_2'}
            var connected_node = {id: 'conn_node_id', label: 'Node_3', title: 'NodeType_3'}
            var connected_node2 = {id: 'conn_node2_id', label: 'Node_4', title: 'NodeType_3'}
            var edge = { id: 'edge_id', from: node.id, to: connected_node.id,
                resource_type: {from: node.title, to: connected_node.title},
                from_node: node, to_node: connected_node};
            var edge2 = { id: 'edge2_id', from: node.id, to: connected_node2.id,
                resource_type: {from: node.title, to: connected_node2.title},
                from_node: node, to_node: connected_node2};
            var depend_edge = {id: 'depend_edge_id', from: node.id, to: depend_node.id,
                resource_type: {from: node.title, to: depend_node.title},
                from_node: node, to_node: depend_node, arrows: {middle: true}};
            $scope.data.nodes.add(node);
            $scope.data.nodes.add(depend_node);
            $scope.data.nodes.add(connected_node);
            $scope.data.nodes.add(connected_node2);
            $scope.data.edges.add(edge);
            $scope.data.edges.add(edge2);
            $scope.data.edges.add(depend_edge);
            hotgenGlobals.update_node_labels(node.title, 'name');
            hotgenGlobals.update_edge_directions(node.title, {'NodeType_3': {property: 'name'}});

            hotgenStates.update_saved_resources(node.id, {type: node.title, data: {name: node.label}})
            hotgenStates.set_incremented_label(node.id, node.label);
            hotgenStates.update_saved_dependsons(node.title, [depend_node.id]);
            hotgenStates.update_saved_dependsons(node.id, [depend_node.id]);
            hotgenStates.set_selected({
                id: 'node_id',
                node: node,
                resource_type: 'NodeType_1',
            });
            var network = {
                deleteSelected: function(){
                    return true;
                },
                getConnectedEdges: function(data){
                    return [edge.id, edge2.id, depend_edge.id,];
                }
            };
            hotgenStates.set_network(network);
            $scope.dialogController($scope, $mdDialog, hotgenStates);
            $scope.dependson = [depend_node.id];
            var returnValue = $scope.save();

            expect($mdDialog.hide).toHaveBeenCalled();
            expect(returnValue).toEqual(true);
        });

        it('save with trivial cases', function(){
            var node = {id: 'node_id', label: 'Node_1', title: 'NodeType_1', icon: {color: '#000'},
                        shape: 'icon', image: 'image-gray.svg'}
            var depend_node = {id: 'depend_node_id', label: 'Node_2', title: 'NodeType_2'}
            var connected_node = {id: 'conn_node_id', label: 'Node_3', title: 'NodeType_3'}
            var edge = { id: 'edge_id', from: node.id, to: connected_node.id,
                resource_type: {from: node.title, to: connected_node.title},
                from_node: node, to_node: connected_node};
            var depend_edge = {id: 'depend_edge_id', from: node.id, to: depend_node.id,
                resource_type: {from: node.title, to: depend_node.title},
                from_node: node, to_node: depend_node, arrows: {middle: true}};
            $scope.data.nodes.add(node);
            $scope.data.nodes.add(depend_node);
            $scope.data.nodes.add(connected_node);
            $scope.data.edges.add(edge);
            $scope.data.edges.add(depend_edge);
            hotgenGlobals.update_node_labels(node.title, 'name');
            hotgenGlobals.update_edge_directions(node.title, {'NodeType_2': {}});

            hotgenStates.update_saved_resources(node.id, {type: node.title, data: {name: node.label}})
            hotgenStates.set_incremented_label(node.id, node.label);
            hotgenStates.update_saved_dependsons(node.title, [depend_node.id]);
            hotgenStates.update_saved_dependsons(node.id, [depend_node.id]);
            hotgenStates.set_selected({
                id: node.id,
                node: node,
                resource_type: node.title,
            });
            var network = {
                deleteSelected: function(){
                    return true;
                },
                getConnectedEdges: function(data){
                    return [edge.id, depend_edge.id];
                }
            };
            hotgenStates.set_network(network);
            $scope.dialogController($scope, $mdDialog, hotgenStates);
            $scope.dependson = [depend_node.id];
            var returnValue = $scope.save();

            expect($mdDialog.hide).toHaveBeenCalled();
            expect(returnValue).toEqual(true);
        });
    });

})();
