(function(){

    'use strict';

    angular
        .module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.LoadingController', [
            '$scope', 'hotgenNotify',
            'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
            function($scope, hotgenNotify, basePath){
                $scope.loading = true;
                $scope.basePath = basePath;
                $scope.$on('handle_resources_loaded', function(event, args){
                    hotgenNotify.show_info('Close loading.');
                    $scope.loading = false;
                });

      }])

})();
