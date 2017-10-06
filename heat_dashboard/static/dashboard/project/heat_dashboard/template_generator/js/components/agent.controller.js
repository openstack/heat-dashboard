(function(){

    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
        .controller('horizon.dashboard.project.heat_dashboard.template_generator.AgentCtrl', [
            '$scope','hotgenAgent', 'hotgenGlobals', 'hotgenMessage',
            function($scope, hotgenAgent, hotgenGlobals, hotgenMessage){

            var init = function(){
                /* *********************************************************************
                 * The following selections should be replaced by OpenStack API response
                 */
                var optionsPromise = hotgenAgent.get_resource_options();
                optionsPromise.then(function(options){
                    if (!options){
                        return;
                    }
                    hotgenGlobals.update_resource_options({
                        auth:{
                            tenant_id: '',
                            admin: false
                        },
                        keypair_types:[
                            {'name': 'ssh'},
                            {'name': 'x509'},
                        ],
                        image_snapshots: [],
                        floating_subnets: [],
                        qos_policies: [],
                    });
                    hotgenGlobals.update_resource_options(options);
                    $scope.template_versions = hotgenGlobals.get_resource_options().template_versions
                    hotgenMessage.broadcast_resources_loaded();
                });
            };

            init();
            $scope.update_template_version = function(template_version){
                hotgenGlobals.set_template_version(template_version)
            }
        }])

})();
