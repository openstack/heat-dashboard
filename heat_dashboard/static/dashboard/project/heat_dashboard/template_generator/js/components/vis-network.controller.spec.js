(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.VisController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $controller, controller, $scope, $rootScope, hotgenGlobals, hotgenStates;

        beforeEach(inject(function($injector){
            hotgenGlobals = $injector.get('hotgenGlobals');
            hotgenStates = $injector.get('hotgenStates');
            $rootScope = $injector.get('$rootScope');
            spyOn($rootScope, '$broadcast');
        }));

        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.VisController', { $scope: $scope,});
        }));

        it('should exist', function(){
            expect(controller).toBeDefined();
        });

        it('check scope parameters', function(){
            expect($scope.data.nodes.length).toEqual(0);
            expect($scope.data.edges.length).toEqual(0);
            expect($scope.options.autoResize).toEqual(true);
        });

        it('check $scope.get_node found', function(){
            $scope.data.nodes.add({id: 'from_id'});
            var returnValue = $scope.get_node('from_id');

            expect(returnValue.id).toEqual('from_id');
        });

        it('check validate edge: invalid same node.', function(){
            var data = {from: 'from_id', to: 'from_id'};
            var returnValue = $scope.validate_edge(data);

            expect(returnValue).toEqual(false);
        });

        it('check validate edge: connection allowed/ not allowed.', function(){
            $scope.data.nodes.add({id: 'from_id', title: 'from_type'});
            $scope.data.nodes.add({id: 'to_id', title: 'to_type'});
            hotgenGlobals.update_edge_directions('from', {to: {}});

            var data = {from: 'from_id', to: 'to_id'};

            expect($scope.validate_edge(data)).toEqual(false);

            hotgenGlobals.update_edge_directions('from_type', {to: {}});

            expect($scope.validate_edge(data)).toEqual(false);

            $scope.data.nodes.add({id: 'another_to_id', title: 'to_type'});
            $scope.data.nodes.add({id: 'third_to_id', title: 'from_type'});
            $scope.network = {getConnectedNodes: function(data){
                return ['another_to_id', 'third_to_id'];
            }}
            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 0}});

            expect($scope.validate_edge(data)).toEqual(false);

            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10, lonely: true}});

            expect($scope.validate_edge(data)).toEqual(false);

            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10, lonely: false, occupied: true}});

            expect($scope.validate_edge(data)).toEqual(false);

            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10, lonely: false, occupied: false}});

            expect($scope.validate_edge(data)).toEqual(true);

            $scope.data.nodes.update({id: 'third_to_id', title: 'another_type'});
            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10, lonely: false, occupied: true}});

            expect($scope.validate_edge(data)).toEqual(true);

        });

        it('manipulation.addEdge: valid to add edge', function(){
            var addEdgeFunction = $scope.options.manipulation.addEdge;
            var data = {from: 'from_id', to: 'to_id'};
            var mockCallbackFunction = jasmine.createSpy().and.callFake(function() {return function(){}})

            spyOn($scope, 'validate_edge').and.callFake(function(){return true});
            addEdgeFunction(data, mockCallbackFunction);

            expect(mockCallbackFunction).toHaveBeenCalledWith(data);

        });

        it('manipulation.addEdge: invalid to add edge', function(){
            var addEdgeFunction = $scope.options.manipulation.addEdge;
            var data = {from: 'from_id', to: 'to_id'};
            var mockCallbackFunction = jasmine.createSpy().and.callFake(function() {return function(){}})

            spyOn($scope, 'validate_edge').and.callFake(function(){return false});
            addEdgeFunction(data, mockCallbackFunction);

            expect(mockCallbackFunction).toHaveBeenCalledWith(null);
        });

        it('manipulation.deleteNode', function(){
            var deleteNodeFunction = $scope.options.manipulation.deleteNode;
            var data = {nodes: ['node_id'], edges:['edge_id']}
            var mockCallbackFunction = jasmine.createSpy().and.callFake(function() {return function(){}})
            deleteNodeFunction(data, mockCallbackFunction);

            expect(mockCallbackFunction).toHaveBeenCalledWith(data);
        });

        it('manipulation.deleteEdge', function(){
            $scope.data.nodes.add({id: 'from_id', title: 'from_type'});
            $scope.data.nodes.add({id: 'to_id', title: 'to_type'});
            $scope.data.edges.add({id: 'edge_id', from: 'from_id', to: 'to_id'});
            var deleteEdgeFunction = $scope.options.manipulation.deleteEdge;
            var data = {edges:['edge_id']}
            var mockCallbackFunction = jasmine.createSpy().and.callFake(function() {return function(){}})
            deleteEdgeFunction(data, mockCallbackFunction);

            expect(mockCallbackFunction).toHaveBeenCalledWith(data);
        });

        it('click nothing', function(){
            var param = {edges: [], nodes: []}

            $scope.click(param);

            expect($rootScope.$broadcast).not.toHaveBeenCalled();
        });

        it('click to show node dialog', function(){
            $scope.data.nodes.add({id: 'from_id', title: 'from_type'});
            var param = {edges: [], nodes: ['from_id']}
            $scope.network = {disableEditMode: function(data){}}

            $scope.click(param);

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_edit_node', 'from_type');
        });

        it('click to show edge dialog', function(){
            $scope.data.nodes.add({id: 'from_id', title: 'from_type'});
            $scope.data.nodes.add({id: 'to_id', title: 'to_type'});
            $scope.data.edges.add({id: 'edge_id', from: 'from_id', to: 'to_id'});
            var param = {edges:['edge_id'], nodes:[]}
            $scope.network = {disableEditMode: function(data){}}

            $scope.click(param);
            var broadcast_param = {
                from_type: 'from_type', to_type: 'to_type',
                from_id: 'from_id', to_id: 'to_id',
            };

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_edit_edge', broadcast_param);
        });

        it('events on load', function(){
            var network = {}
            spyOn(hotgenStates, 'set_network');
            var onloadFunction = $scope.events.onload;
            onloadFunction(network);

            expect(hotgenStates.set_network).toHaveBeenCalledWith(network);
        });

        it('get_added_edge_id: find the extra item', function(){
            var old_ids = [1 ,2 ,3, 4];
            var new_ids = [1, 2, 5, 3, 4];
            var find = $scope.get_added_edge_id(old_ids, new_ids);

            expect(find).toEqual(5);
        });

        it('get mapping', function(){
            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10}});

            expect($scope.get_mapping('from_type', 'to_type').limit).toEqual(10);
            expect($scope.get_mapping('from_type', 'to')).toEqual(false);
            expect($scope.get_mapping('from', 'to')).toEqual(false);
        });

        it('get modal: found/not found', function(){
            hotgenGlobals.update_edge_directions('from_type', {to_type: {limit: 10, modal: 'modal'}});
            $scope.data.nodes.add({id: 'from_id', title: 'from_type'});
            $scope.data.nodes.add({id: 'to_id', title: 'to_type'});
            $scope.data.nodes.add({id: 'from', title: 'from'});

            expect($scope.get_modal({from: 'from_id', to: 'to_id'})).toEqual('modal');
            expect($scope.get_modal({from: 'from', to: 'to_id'})).toEqual(undefined);

        })
    });

})();
