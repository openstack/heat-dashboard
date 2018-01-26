(function(){
    'use strict';

    /* Directive <depends-on></depends-on>
     *
     */

    function dependsonController($scope, hotgenStates, basePath){
        this.$onInit = function(){
            $scope.dependson = this.dependson;
        }
        $scope.basePath = basePath;
        $scope.edges = hotgenStates.get_edges();
        $scope.nodes = hotgenStates.get_nodes();
        $scope.selected = hotgenStates.get_selected();
        $scope.toggle = function (item, list) {
            if (typeof item == 'undefined' || !(list instanceof Array)){
                return;
            }
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            else {
                list.push(item);
            }
        };

        $scope.exists = function (item, list) {
          if (typeof item != "undefined" && list instanceof Array){
            return list.indexOf(item) > -1;
          }
          return false;
        };

    }

    function dependsonPath (basePath){
        return  basePath + 'templates/depends_on.html';
    }
    dependsonPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];
    dependsonController.$inject = [
                '$scope', 'hotgenStates',
                'horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .component('dependsOn', {
        templateUrl: dependsonPath,
        controller: dependsonController,
        bindings:{
            'dependson': '=',
        }
    });

})();
