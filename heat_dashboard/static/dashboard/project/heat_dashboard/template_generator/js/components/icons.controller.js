(function() {
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .controller('horizon.dashboard.project.heat_dashboard.template_generator.IconController', ['$scope', 'hotgenGlobals',
     'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
     function($scope, hotgenGlobals, basePath){
        $scope.resource_types = hotgenGlobals.get_resource_icons();
        $scope.resource_admin = hotgenGlobals.get_node_admin();
        $scope.admin = hotgenGlobals.get_resource_options().auth.admin;
        $scope.basePath = basePath;

        $scope.project_types = {};
        for (var idx in $scope.resource_types){
            var pidx = idx.split('__');
            if (!pidx || pidx.length != 3){
            continue
        }
        var level = pidx[0]+'::'+pidx[1]
        if (! (level in $scope.project_types)){
            $scope.project_types[level] = {}
        }
        $scope.project_types[level][idx] = $scope.resource_types[idx];
        }
        $scope.currentNavItem = Object.keys($scope.project_types)[0];
        $scope.showIcon = function(){
//            console.log($scope.currentNavItem)
        };

    }]);
})();


