(function(){

    'use strict';

    angular
      .module('horizon.dashboard.project.heat_dashboard.template_generator')
      .controller('horizon.dashboard.project.heat_dashboard.template_generator.DraftMenuController', ['$scope',
        '$mdDialog', 'hotgenStates', 'hotgenGlobals', 'hotgenNotify', 'hotgenMessage',
        'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
        function($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify, hotgenMessage, basePath){
            $scope.basePath = basePath;
            var originatorEv;
            $scope.openMenu = function($mdMenu, ev){
                originatorEv = ev;
                $mdMenu.open(ev);
            };
            $scope.data = {
                nodes: hotgenStates.get_nodes(),
                edges: hotgenStates.get_edges(),
            }
            $scope.save_draft = function(){
                if ($scope.data.nodes.length == 0 && $scope.data.edges.length == 0){
                    hotgenNotify.show_warning('No resource to save.');
                    return;
                }
                if (localStorage.saved_counter) {
                    localStorage.saved_counter = (Number(localStorage.saved_counter) + 1)%10;
                } else {
                    localStorage.saved_counter = 0;
                }
                var data = {
                    nodes: $scope.data.nodes._data,
                    edges: $scope.data.edges._data,
                    saved_resources: hotgenStates.get_saved_resources(),
                    saved_depends_ons: hotgenStates.get_saved_dependsons(),
                    is_saved: hotgenStates.get_saved_flags(),
                    incremented_labels: hotgenStates.get_incremented_labels(),
                    counter: hotgenStates.get_counters(),
                    template_version: hotgenGlobals.get_template_version(),
                }

                var today = new Date();
                data['time'] = today.toUTCString();
                var drafts_serial = JSON.stringify(data);
                localStorage.setItem('draft_'+localStorage.saved_counter, drafts_serial);

                hotgenNotify.show_success('Draft is saved successfully at '+today.toUTCString()+'.');
            }
            $scope.load_draft = function(){
                hotgenMessage.broadcast_load_draft();
            }
            $scope.import_draft = function(){
                hotgenNotify.show_warning('Not Implemented.');
            }
            $scope.export_draft = function(){
                hotgenNotify.show_warning('Not Implemented.');
            }
    }]);

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.ClearCanvasController', ['$scope',
            'hotgenStates', 'hotgenNotify',
            'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
            function($scope, hotgenStates, hotgenNotify, basePath){
                $scope.basePath = basePath;
                $scope.data = {
                    nodes: hotgenStates.get_nodes(),
                    edges: hotgenStates.get_edges(),
                }
                $scope.clear_canvas = function(){
                    $scope.data.nodes.clear();
                    $scope.data.edges.clear();
                    hotgenStates.clear_states();
                    hotgenNotify.show_success('The Canvas has been initialized.');
                };

        }]);


})();
