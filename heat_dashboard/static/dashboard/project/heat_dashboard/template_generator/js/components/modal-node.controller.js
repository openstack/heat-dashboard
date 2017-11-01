(function() {
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.FormModalController', ['$scope', '$compile',
            '$mdDialog', 'hotgenNotify', 'hotgenMessage', 'hotgenGlobals', 'hotgenUtils', 'hotgenStates',
            'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
            function($scope, $compile, $mdDialog,
                     hotgenNotify, hotgenMessage, hotgenGlobals, hotgenUtils, hotgenStates, basePath){

                $scope.selected = hotgenStates.get_selected();
                $scope.data = {
                    nodes: hotgenStates.get_nodes(),
                    edges: hotgenStates.get_edges(),
                };
                $scope.dialogController = function ($scope, $mdDialog, hotgenStates) {
                    $scope.delete_resource = function() {
                        var label = hotgenStates.get_selected().node.label;
                        hotgenStates.get_network().deleteSelected();
                        hotgenNotify.show_success(label + ' has been delete successfully.')
                        $mdDialog.cancel();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.selected = hotgenStates.get_selected();
                    $scope.data = {
                        nodes: hotgenStates.get_nodes(),
                        edges: hotgenStates.get_edges(),
                    };

                    $scope.save = function() {
                        $mdDialog.hide();
                        hotgenStates.update_saved_resources($scope.selected.id, {
                                type: $scope.selected.resource_type,
                                data: angular.copy($scope.resource)
                            });
                        hotgenStates.update_saved_dependsons($scope.selected.id, $scope.dependson);

                        var label = hotgenStates.get_label_by_uuid($scope.selected.node.id);
                        var prop_label = $scope.get_label($scope.selected.resource_type);
                        if (prop_label && $scope.resource[prop_label]){
                          label = label + '(' + $scope.resource[prop_label]+')';
                        }
                        var new_node_image = $scope.data.nodes.get($scope.selected.id).image.replace('-gray.svg', '-blue.svg');
                        var shape = $scope.selected.node.shape;
                        var color = "#3f51b5"
                        if (shape === 'icon'){
                            color = $scope.selected.node.icon.color;
                        }

                        $scope.data.nodes.update({
                              id: $scope.selected.id,
                              label: label,
                              font: { color: color},
                              image: new_node_image,
                            })
                        // Mark the node is saved.
                        hotgenStates.update_saved_flags($scope.selected.id, true);

                        // Update depends on edges

                        var related_edges = hotgenStates.get_network().getConnectedEdges($scope.selected.id);
                        for ( var idx in related_edges){
                            var edge = $scope.data.edges.get(related_edges[idx]);
                            if (edge.from == $scope.selected.id && edge.arrows && edge.arrows.middle == true){
                                $scope.data.edges.remove(edge.id);
                            }
                        }
                        for (var idx in $scope.dependson){
                            $scope.data.edges.add({
                                from: $scope.selected.id,
                                to: $scope.dependson[idx],
                                arrows: {middle:true},
                                dashes: false,
                                color: '#448AFF',
                            });
                        }

                        // Mark edges connected from the node are saved and update style.
                        for (var idx in $scope.connectedoptions){
                            var connected_option = $scope.connectedoptions[idx];
                            for (var idx_edge in connected_option){
                                hotgenStates.update_saved_flags(connected_option[idx_edge].edge.id, true);
                                var color = "#3f51b5";
                                $scope.data.edges.update({
                                  id: connected_option[idx_edge].edge.id,
                                  dashes: false,
                                  color: color,
                                })
                          }
                        }
                        return true;
                    };

                    $scope.resource_type = $scope.selected.resource_type.replace(/_/g, ':');

                    if ($scope.selected.id in hotgenStates.get_saved_resources()){
                        $scope.resource = hotgenStates.get_saved_resources()[$scope.selected.id].data;
                    } else{
                        $scope.resource = {}
                    }
                    if ($scope.selected.id in hotgenStates.get_saved_dependsons()){
                        $scope.dependson = hotgenStates.get_saved_dependsons()[$scope.selected.id];
                    } else{
                        $scope.dependson = []
                    }
                    // Add connected edge resource
                    $scope.get_connected_options = function(){
                        var related_edges = hotgenStates.get_network().getConnectedEdges($scope.selected.id);
                        var connected_options = {};
                        for (var idx in related_edges){
                            var edge = $scope.data.edges.get(related_edges[idx]);
                            if (edge.from != $scope.selected.id || (edge.arrows &&  edge.arrows.middle == true)){
                                continue;
                            }
                            var node = $scope.data.nodes.get(edge.to);
                            var edge_directions = hotgenGlobals.get_edge_directions();
                            if (! ($scope.selected.resource_type in edge_directions)){
                                continue;
                            }
                            var mapping = edge_directions[$scope.selected.resource_type];
                            if (!(node.title in mapping)){
                                continue;
                            }
                            var property = mapping[node.title].property;
                            if (!(property in connected_options)){
                                connected_options[property] = [];
                            }
                            connected_options[property].push({
                                value: hotgenUtils.get_resource_string(hotgenStates.get_label_by_uuid(node.id)),
                                id: node.id,
                                resource_type: node.title,
                                edge: edge
                            });

                        }
                        return connected_options;
                    }
                    $scope.connectedoptions = $scope.get_connected_options();
                    $scope.component = hotgenGlobals.get_resource_components()[$scope.selected.resource_type];

                    $scope.get_label = function(node_type){
                        return hotgenGlobals.get_node_labels()[node_type];
                    }

                }

                $scope.showTabDialog = function(){
                    $scope.dialogController.$inject = ['$scope', '$mdDialog', 'hotgenStates'];

                    $mdDialog.show({
                        controller: $scope.dialogController,
                        controllerAs: 'ctrl',
                        templateUrl: basePath+'templates/modal_resource.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:true
                    }).then(function(){
                        hotgenNotify.show_success('The selected resource is saved successfully.');
                    }, function(){
    //                    hotgenNotify.show_error('dismiss a modal');
                    });
                };
                $scope.handle_edit_node = function(event, args){
                    hotgenNotify.show_info('Show details of resource ' + args.replace(/_/g, ':') +'.');
                    $scope.showTabDialog();
                }
                $scope.$on('handle_edit_node', $scope.handle_edit_node);

            }]);
})();

