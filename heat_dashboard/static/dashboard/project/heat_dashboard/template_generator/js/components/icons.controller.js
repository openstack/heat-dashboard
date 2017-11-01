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
    }]);

})();


