(function(angular) {
    'use strict';

    // OS::Neutron::FloatingIPAssociation

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronFloatingipAssociationSettings',
        {
            resource_key: "OS__Neutron__FloatingIPAssociation",
            admin: false,
            icon: {
                class: 'fa-paperclip',
                name: 'OS::Neutron::FloatingIPAssociation',
                code: '\uf0c6',
                color: '#40a5f2'
            },
            label: 'fixed_ip_address',
            modal_component: '<os-neutron-floatingip-association floatingipassociation="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-neutron-floatingip-association>',
            edge_settings: {
                'OS__Neutron__FloatingIP': {
                    'type': 'property',
                    'property': 'floatingip_id',
                    'limit': 1,
                },
                'OS__Neutron__Port': {
                    'type': 'property',
                    'property': 'port_id',
                    'limit': 1,
                },
            },
            necessary_properties: {
                'floatingip_id': ['OS__Neutron__FloatingIP'],
                'port_id': ['OS__Neutron__Port'],
            }
        }
    )

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronFloatingipAssociationSettings', 'hotgenGlobals', function(osNeutronFloatingipAssociationSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronFloatingipAssociationSettings.resource_key,
            osNeutronFloatingipAssociationSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronFloatingipAssociationSettings.resource_key,
            osNeutronFloatingipAssociationSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronFloatingipAssociationSettings.resource_key,
            osNeutronFloatingipAssociationSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronFloatingipAssociationSettings.resource_key,
            osNeutronFloatingipAssociationSettings.label);

    }]);
    function osNeutronFloatingipAssociationController($scope, hotgenGlobals, validationRules){
        this.$onInit = function(){
            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = [];
            } else{
                $scope.connected_options = this.connectedoptions;
            }
            this.disable = {'floatingip_id': false, 'port_id': false}
            $scope.dependson = this.dependson;
            $scope.update = {
                floatingips: $scope.get_floatingip_options(),
                ports: $scope.get_port_options(),
            }

            if ( $scope.connected_options.floatingip_id && $scope.connected_options.floatingip_id.length > 0){
                this.floatingipassociation['floatingip_id'] = $scope.connected_options.floatingip_id[0].value;
                this.disable.floatingip_id = true;
            }
            if ( $scope.connected_options.port_id && $scope.connected_options.port_id.length > 0){
                this.floatingipassociation['port_id'] = $scope.connected_options.port_id[0].value;
                this.disable.port_id = true;
            }
        }
        $scope.options = hotgenGlobals.get_resource_options();
        $scope.validate_ip_address = validationRules['ip_address'];

        $scope.get_floatingip_options = function(){
            if ('floatingip_id' in $scope.connected_options){
                var resource_fip = [];
                for (var idx in $scope.connected_options.floatingip_id){
                    var item = $scope.connected_options.floatingip_id[idx];
                    resource_fip.push({
                        id: item.value,
                    })
                }
                return $scope.options.floatingips.concat(resource_fip);
            }
            return $scope.options.floatingips;
        }

        $scope.get_port_options = function(){
            if ('port_id' in $scope.connected_options){
                var resource_port = [];
                for (var idx in $scope.connected_options.port_id){
                    var item = $scope.connected_options.port_id[idx];
                    resource_port.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.ports.concat(resource_port);
            }
            return $scope.options.ports;
        }
    }
    osNeutronFloatingipAssociationController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osNeutronFloatingipAssociationPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronFloatingipAssociationPath(basePath){
        return basePath + 'js/resources/os__neutron__floatingipassociation/os__neutron__floatingipassociation.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronFloatingipAssociation', {
        templateUrl: osNeutronFloatingipAssociationPath,
        controller: osNeutronFloatingipAssociationController,
        bindings:{
          'floatingipassociation': '=',
          'dependson': '=',
          'formReference': '<',
          'connectedoptions': '<',
        }
    });

})(window.angular);
