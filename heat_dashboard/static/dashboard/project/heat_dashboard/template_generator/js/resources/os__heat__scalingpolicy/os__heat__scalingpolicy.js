(function() {
    'use strict';

    /* OS::Heat::ScalingPolicy
     *
     */

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .value('osHeatScalingPolicySettings',
        {
            resource_key: "OS__Heat__ScalingPolicy",
            admin: false,
            icon: {
                class: 'fa-clone',
                name: 'OS::Heat::ScalingPolicy',
                code: '\uf24d',
                color: '#0bb238'
            },
            label: 'name',
            modal_component: '<os-heat-scalingpolicy scalingpolicy="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-heat-scalingpolicy>',
            edge_settings:  {
                'OS__Heat__AutoScalingGroup': {
                    'type': 'property',
                    'property': 'auto_scaling_group_id',
                    'limit': 1,
                    'occupied': false, //* whether can be connected to any other resource */
                    'lonely': false,  //* whether can be connected to one more other resource */
                    'modal': null
                }
            },
            necessary_properties: ['adjustment_type', 'scaling_adjustment', 'auto_scaling_group_id']
        }
    )

    // Register the resource to globals
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .run(['osHeatScalingPolicySettings','hotgenGlobals', function(osHeatScalingPolicySettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osHeatScalingPolicySettings.resource_key ,
            osHeatScalingPolicySettings.icon);

        hotgenGlobals.update_resource_components(
            osHeatScalingPolicySettings.resource_key,
            osHeatScalingPolicySettings.modal_component);

        hotgenGlobals.update_node_labels(
            osHeatScalingPolicySettings.resource_key,
            osHeatScalingPolicySettings.label);

        hotgenGlobals.update_edge_directions(
            osHeatScalingPolicySettings.resource_key,
            osHeatScalingPolicySettings.edge_settings);
    }]);


    // Define  <os-heat-scalingpolicy> controller
    function osHeatScalingPolicyController($scope, hotgenGlobals, hotgenNotify, validationRules) {
        this.$onInit = function(){
            $scope.dependson = this.dependson;
            $scope.min_adj_step_disabled = false;
            if (this.scalingpolicy.adjustment_type !=='percent_change_in_capacity'){
                this.scalingpolicy.min_adjustment_step = '';
                $scope.min_adj_step_disabled = true;
            }
            $scope.auto_scaling_group_id_disabled = false;
            $scope.auto_scaling_group_id_pattern = $scope.validate_uuid4;
            if (this.connectedoptions.auto_scaling_group_id){
                for (var idx in this.connectedoptions.auto_scaling_group_id){
                    this.scalingpolicy.auto_scaling_group_id = this.connectedoptions.auto_scaling_group_id[idx].value;
                    break;
                }
                $scope.auto_scaling_group_id_disabled = true;
                $scope.auto_scaling_group_id_pattern = "";
            } else{
                if (this.scalingpolicy.auto_scaling_group_id && this.scalingpolicy.auto_scaling_group_id.indexOf('get_resource') >= 0){
                    // no edge with AutoScalingGroup but still holding get_resource dependency,
                    // consider edge is removed and empty auto_scaling_group_id
                    this.scalingpolicy.auto_scaling_group_id = "";
                }

                $scope.auto_scaling_group_id_disabled = false;
            }
        };

        $scope.validate_integer = validationRules['integer'];
        $scope.validate_uuid4= validationRules['uuid4'];
        $scope.controller = this;
        $scope.adjustment_types = [
            {'value': 'change_in_capacity', 'name': 'Change in Capacity'},
            {'value': 'exact_capacity', 'name': 'Exact Capacity'},
            {'value': 'percent_change_in_capacity', 'name': 'Percent Change in Capacity'},
        ];

        $scope.$watch('controller.scalingpolicy.adjustment_type', function(newValue, oldValue){
            if (oldValue === newValue){
                return;
            }
            if (newValue === 'percent_change_in_capacity'){
                $scope.min_adj_step_disabled = false;
            } else{
                $scope.controller.scalingpolicy.min_adjustment_step = '';
                $scope.min_adj_step_disabled = true;
            }
        });
    }

    function osHeatScalingPolicyPath (basePath){
        return  basePath + 'js/resources/os__heat__scalingpolicy/os__heat__scalingpolicy.html';
    }

    osHeatScalingPolicyController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osHeatScalingPolicyPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osHeatScalingpolicy', {
        templateUrl: osHeatScalingPolicyPath,
        controller: osHeatScalingPolicyController,
        bindings: {
          'scalingpolicy': '=',
          'dependson': '=',
          'connectedoptions': '<',
          'formReference': '<',
        }
    });


})();