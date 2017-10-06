(function(){
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.EdgeFormModalCtrl',  ['$scope',
            '$mdDialog', 'hotgenNotify', 'hotgenMessage', 'hotgenGlobals', 'hotgenStates',
            'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
            function($scope, $mdDialog, hotgenNotify, hotgenMessage, hotgenGlobals, hotgenStates, basePath){
                $scope.showTabDialog = function(){
                        $mdDialog.show({
                          controller: EdgeDialogController,
                          controllerAs: 'ctrl',
                          templateUrl: basePath+'templates/modal_edge.html',
                          parent: angular.element(document.body),
                          clickOutsideToClose:true
                        }).then(function(){
//                            hotgenNotify.show_success('close the modal');
                        }, function(){
//                            hotgenNotify.show_error('dismiss a modal');
                        });
                    EdgeDialogController.$inject = ['$scope', '$mdDialog', 'hotgenStates'];
                    function EdgeDialogController($scope, $mdDialog, hotgenStates,) {
                        $scope.is_depends = false;
                        $scope.delete_resource = function() {
                            hotgenStates.get_network().deleteSelected();
                            hotgenNotify.show_success('The selected edge has been delete successfully.')
                            $mdDialog.cancel();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.selected = hotgenStates.get_selected();
                        if ($scope.selected.id in hotgenStates.get_saved_resources()){
                            $scope.resource = hotgenStates.get_saved_resources()[$scope.selected.id].data;
                        } else{
                            $scope.resource = {}
                        }
                        if ($scope.selected.edge.arrows && $scope.selected.edge.arrows.middle == true){
                            $scope.is_depends = true;
                        }
                        var from_type = $scope.selected.resource_type.from;
                        var to_type = $scope.selected.resource_type.to;
                        $scope.from_type = from_type.replace(/_/g, ':');
                        $scope.to_type = to_type.replace(/_/g, ':');
                        $scope.from_node = {
                            class: hotgenGlobals.get_resource_icons()[from_type].class,
                            color: hotgenGlobals.get_resource_icons()[from_type].color,
                            id: $scope.selected.from_node.id,
                        }
                        $scope.to_node = {
                            class: hotgenGlobals.get_resource_icons()[to_type].class,
                            color: hotgenGlobals.get_resource_icons()[to_type].color,
                            id: $scope.selected.to_node.id,
                        }
                    }
                };
                $scope.$on('handle_edit_edge', function(event, args){
                    /* Click a edge and decide to show modal or not */
                    var from_type = args.from_type;
                    var to_type = args.to_type;
                    var from_id = args.from_id;
                    var to_id = args.to_id;
                    var edge_directions = hotgenGlobals.get_edge_directions();
                    var depends_ons = hotgenStates.get_saved_dependsons();
                    if ( !( from_type in edge_directions) || !(to_type in edge_directions[from_type])){
                        if (from_id in depends_ons && depends_ons[from_id] == to_id){
                            ;
                        }
                        else {
                            hotgenNotify.show_warning('The edge might be invalid.');
                            return;
                        }
                    }
                    $scope.showTabDialog();
                });
            }]);

})();