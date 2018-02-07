(function() {
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.VisController',
            ['$scope', '$rootScope', 'hotgenNotify', 'hotgenMessage', 'hotgenGlobals', 'hotgenStates',
             'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
            function($scope, $rootScope, hotgenNotify, hotgenMessage, hotgenGlobals, hotgenStates, basePath) {
                $rootScope.message_level = 2;
                hotgenStates.clear_states();
                $scope.data = {
                    nodes: hotgenStates.get_nodes(),
                    edges: hotgenStates.get_edges(),
                };
                $scope.options = {
                    autoResize: true,
                    edges: {
                        smooth: false,
    //                    arrows: 'to',
                        dashes: true,
    //                    length: 300,
                        color: {
                            color: '#848484',
                            highlight: '#848484',
                            hover: '#848484',
                        }
                    },
                    nodes: {
                        brokenImage: basePath+'css/img/icons/unknown-gray.svg',
                    },
                    interaction: {
                        hover: true,
                    },
                    physics: {
                        enabled: true,
                        solver: 'forceAtlas2Based',
                        forceAtlas2Based: {
                            avoidOverlap: 1,
                        },
                        barnesHut: {
                            avoidOverlap: 1
                        }
                    },
                    manipulation: {
                        enabled: true,
                        addEdge: function(data, callback){
                            var valid = $scope.validate_edge(data);
                            if (valid == false){
                                callback(null);
                            } else{
                                hotgenNotify.show_success("Successfully connected.");
                                callback(data);
                                $scope.data.nodes.update({
                                    id: data.from,
                                    font: {color: '#343434'}
                                })
                                hotgenStates.update_saved_flags(data.id, false);
                                hotgenStates.update_saved_flags(data.from, false);
                            }
                        },
                        addNode: false,
                        editEdge: false,
                        deleteNode: function(data, callback){
                            var node_ids = data.nodes;
                            var edge_ids = data.edges;
                            for (var idx in node_ids){
                                delete hotgenStates.get_saved_flags()[node_ids[idx]];
                                hotgenStates.delete_saved_resources(node_ids[idx]);
                            }
                            for (var idx in edge_ids){
                                delete hotgenStates.get_saved_flags()[edge_ids[idx]];
                                hotgenStates.delete_saved_resources(edge_ids[idx]);
                            }
                            callback(data);
                        },
                        deleteEdge: function(data, callback){
                            var edge_ids = data.edges;
                            for (var idx in edge_ids){
                                var edge_id = edge_ids[idx];
                                delete hotgenStates.get_saved_flags()[edge_id];
                                var from_id = $scope.data.edges.get(edge_id).from;
                                hotgenStates.update_saved_flags(from_id, false);
                                $scope.data.nodes.update({
                                    id: from_id,
                                    font: {color: '#343434'}
                                })
                            }

                            callback(data);
                        },
                    },
                };

                $scope.click = function(params){
                    if (params.nodes.length > 0){
                        $scope.network.disableEditMode();
                        var selected_id = params.nodes[0];
                        var selected_node = $scope.data.nodes.get(selected_id);
                        var selected_type = selected_node.title
                        hotgenStates.set_selected({
                            element: 'node',
                            resource_type: selected_type,
                            id: selected_id,
                            node: selected_node,
                        }) ;
                        hotgenMessage.broadcast_edit_node(selected_type);
                    } else if (params.edges.length > 0){
                        $scope.network.disableEditMode();
                        var selected_id = params.edges[0];
                        var selected_edge = $scope.data.edges.get(selected_id);
                        var from_node = $scope.data.nodes.get(selected_edge.from);
                        var to_node = $scope.data.nodes.get(selected_edge.to);

                        hotgenStates.set_selected({
                            element: 'edge',
                            resource_type: {from: from_node.title, to: to_node.title},
                            from_node: from_node,
                            to_node: to_node,
                            id: selected_id,
                            edge: selected_edge,
                        });
                        hotgenMessage.broadcast_edit_edge(from_node.title, to_node.title, from_node.id, to_node.id);
                    } else {
//                        ;
                    }
                };

                $scope.events = {
                    click: $scope.click,
                    onload: function(network){
                        $scope.network = network;
                        hotgenStates.set_network(network);
                    }
                };

                $scope.get_added_edge_id = function(old_edge_ids, new_edge_ids){
                    for (var id in new_edge_ids){
                        if (old_edge_ids.indexOf(new_edge_ids[id]) == -1){
                            return new_edge_ids[id];
                        }
                    }
                }
                $scope.get_modal = function(data){
                    var from_node = $scope.get_node(data.from);
                    var to_node = $scope.get_node(data.to);
                    var mapping = $scope.get_mapping(from_node.title, to_node.title);
                    if (mapping){
                        return mapping.modal;
                    }
                    return ;
                }

                $scope.get_mapping = function (from_type, to_type){
                    var edge_directions = hotgenGlobals.get_edge_directions()
                    if ((! edge_directions[from_type]) || !(edge_directions[from_type][to_type])){
                        hotgenNotify.show_error(to_type.replace(/_/g, ':')+" cannot be connected with "+from_type.replace(/_/g, ':')+".");
                        return false;
                    }
                    return edge_directions[from_type][to_type]

                }

                $scope.get_node = function(node_id){
                    return $scope.data.nodes.get(node_id);
                }

                $scope.validate_edge = function(data){
                    if (data.from == data.to ){
//                        hotgenNotify.show_warning("");
                        return false;
                    }
                    var from_node = $scope.get_node(data.from);
                    var to_node = $scope.get_node(data.to);
                    var from_node_type = from_node.title;
                    var to_node_type = to_node.title;
                    var edge_directions = hotgenGlobals.get_edge_directions()
                    if ((! edge_directions[from_node_type]) || !(edge_directions[from_node_type][to_node_type])){
                        hotgenNotify.show_error(to_node.label+" cannot be connected with "+from_node.label+".");
                        return false;
                    } else{
                        var limit = edge_directions[from_node_type][to_node_type].limit;
                        var occupied = edge_directions[from_node_type][to_node_type].occupied;
                        var lonely = edge_directions[from_node_type][to_node_type].lonely;
                        var from_connected = $scope.network.getConnectedNodes(data.from);
                        var count = 0;
                        for(var idx in from_connected){
                            var item_title = $scope.data.nodes.get(from_connected[idx]).title;
                            if (to_node_type == item_title){
                                count += 1;
                            }
                        }
                        if (count >= limit){
                            hotgenNotify.show_error("The number of connections between the resources is out of limit.");
                            return false;
                        }
                        var to_connected = $scope.network.getConnectedNodes(data.to);
                        if (lonely === true && to_connected.length > 0) {
                            hotgenNotify.show_error(to_node.label+" cannot be connected with "+from_node.label+".");
                            return false;
                        }
                        if (occupied === true){
                            for (var idx in to_connected){
                                var item_title = $scope.data.nodes.get(to_connected[idx]).title;
                                if (from_node_type == item_title){
                                    hotgenNotify.show_error(to_node.label+" has already been connected with "+from_node_type+".");
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                }
            }
        ]);
})();
