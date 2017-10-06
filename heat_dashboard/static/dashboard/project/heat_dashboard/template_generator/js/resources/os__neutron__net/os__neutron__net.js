(function(angular) {
    'use strict';

    // OS::Neutron::Net

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronNetSettings',
        {
            resource_key: "OS__Neutron__Net",
            admin: false,
            icon: {
                class: 'fa-cloud',
                name: 'OS::Neutron::Net',
                code: '\uf0c2',
                color: '#40a5f2'
            },
            label: 'name',
            modal_component: '<os-neutron-net network="resource" dependson="dependson" form-reference="resourceForm"></os-neutron-net>',
            edge_settings: null,
            necessary_properties: null
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronNetSettings', 'hotgenGlobals', function(osNeutronNetSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronNetSettings.resource_key,
            osNeutronNetSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronNetSettings.resource_key,
            osNeutronNetSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronNetSettings.resource_key,
            osNeutronNetSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronNetSettings.resource_key,
            osNeutronNetSettings.label);

    }]);

    function osNeutronNetController($scope, hotgenGlobals, validationRules){
        this.$onInit = function(){
            this.admin = $scope.options.auth.admin;
            if (typeof this.network.tags == 'undefined'){
                this.network.tags = []
            }
            if (typeof this.network.dhcp_agent_ids === 'undefined'){
                this.network.dhcp_agent_ids = [];
            }
            if (typeof this.network.admin_state_up === 'undefined'){
                this.network.admin_state_up = true;
            }
            if (typeof this.network.value_specs == 'undefined'){
                this.network.value_specs = [{}]
            }
            $scope.dependson = this.dependson;

        };

        this.add_value_specs = function(){
            this.network.value_specs.push({})
        }
        this.delete_value_specs = function(index){
            this.network.value_specs.splice(index, 1)
        }

        $scope.options = hotgenGlobals.get_resource_options();
        $scope.qos_policies = $scope.options.qos_policies;
        $scope.show_more = false;
        $scope.validate_name = validationRules['name'];
        $scope.validate_domain = validationRules['domain'];
        $scope.validate_uuid_nohyphe = validationRules['uuid_nohyphen'];

    }

    osNeutronNetController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osNeutronNetPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronNetPath(basePath){
        return basePath + 'js/resources/os__neutron__net/os__neutron__net.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronNet', {
      templateUrl: osNeutronNetPath,
      controller: osNeutronNetController,
      bindings:{
        'network': '=',
        'dependson': '=',
        'formReference': '<',
      }
    });

})(window.angular);
