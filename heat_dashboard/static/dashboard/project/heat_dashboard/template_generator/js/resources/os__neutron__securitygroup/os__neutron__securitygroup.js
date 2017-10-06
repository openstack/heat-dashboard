(function(angular) {
    'use strict';

    // OS::Neutron::SecurityGroup

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronSecurityGroupSettings',
        {
            resource_key: "OS__Neutron__SecurityGroup",
            admin: false,
            icon: {
                class: 'fa-shield ',
                name: 'OS::Neutron::SecurityGroup',
                code: '\uf132',
                color: '#40a5f2'
            },
            label: 'name',
            modal_component: '<os-neutron-security-group securitygroup="resource" dependson="dependson" form-reference="resourceForm"></os-neutron-security-group>',
            edge_settings: null,
            necessary_properties: null
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronSecurityGroupSettings', 'hotgenGlobals', function(osNeutronSecurityGroupSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronSecurityGroupSettings.resource_key,
            osNeutronSecurityGroupSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronSecurityGroupSettings.resource_key,
            osNeutronSecurityGroupSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronSecurityGroupSettings.resource_key,
            osNeutronSecurityGroupSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronSecurityGroupSettings.resource_key,
            osNeutronSecurityGroupSettings.label);
    }]);

    function osNeutronSecurityGroupController($scope, validationRules) {
        this.$onInit = function(){
            if (typeof this.securitygroup.rules === 'undefined'){
                this.securitygroup.rules = [{}];
            }

            $scope.dependson = this.dependson;

        }
        this.add_rule = function(){
            this.securitygroup.rules.push({})
        }
        this.delete_rule = function(index){
            this.securitygroup.rules.splice(index, 1)
        }
        $scope.validate_name = validationRules['name'];
        $scope.validate_cidr = validationRules['cidr'];
    }
    osNeutronSecurityGroupController.$inject = ['$scope',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',];
    osNeutronSecurityGroupPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronSecurityGroupPath(basePath){
        return basePath + 'js/resources/os__neutron__securitygroup/os__neutron__securitygroup.html';
    }


    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronSecurityGroup', {
      templateUrl: osNeutronSecurityGroupPath,
      controller: osNeutronSecurityGroupController,
      bindings:{
        'securitygroup': '=',
        'dependson': '=',
        'formReference': '<',
      }
    });

})(window.angular);
