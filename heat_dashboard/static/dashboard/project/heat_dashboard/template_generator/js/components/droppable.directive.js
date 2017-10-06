(function() {
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').directive('droppable',
    ['hotgenGlobals', 'hotgenUUID', 'hotgenStates',
     'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
       function(hotgenGlobals, hotgenUUID, hotgenStates, basePath){
        return {
            link: function ($scope, element){
                $scope.data = {
                    nodes: hotgenStates.get_nodes(),
                    edges: hotgenStates.get_edges(),
                }
                var el = element[0];
                el.addEventListener('dragover', function(e){
                    if (e.preventDefault){
                        e.preventDefault();
                    }
                },true);
                el.addEventListener('drop', function(e){
                    var resource_types = hotgenGlobals.get_resource_icons();
                    var dropped_elem_id = e.dataTransfer.getData("text");
                    var dropped_elem_base = document.getElementById(dropped_elem_id);
                    var resource_type = dropped_elem_id;
                    var shorten_resource_type = resource_type.split('__')[2]
                    var dragged_resource = resource_types[resource_type];
                    var counter = hotgenStates.increment_counter(shorten_resource_type);
                    var id = hotgenUUID.uuid();
                    var node_label = shorten_resource_type+'_'+counter;
                    hotgenStates.set_incremented_label(id, node_label)
                    $scope.data.nodes.add({
                        id: id,
                        label: node_label,
                        shape: 'image',
                        title: resource_type,
                        icon: {
                            face: 'FontAwesome',
                            code: dragged_resource.code,
                            size: 50,
                            color: dragged_resource.color,
                        },
                        image: basePath+'js/resources/'+resource_type.toLowerCase()+'/'+resource_type.toLowerCase()+'-gray.svg',
                    });
                    hotgenStates.update_saved_flags(id, false)
                    e.preventDefault();
                },false);
            }
        }
    }]);


})();