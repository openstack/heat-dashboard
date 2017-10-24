(function(angular) {
    'use strict';

    // OS::Neutron::RouterInterface

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronRouterInterfaceSettings',
        {
            resource_key: "OS__Neutron__RouterInterface",
            admin: false,
            icon: {
                class: 'fa-sun-o',
                name: 'OS::Neutron::RouterInterface',
                code: '\uf185',
                color: '#40a5f2'
            },
            modal_component: '<os-neutron-router-interface routerinterface="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-neutron-router-interface>',
            edge_settings: {
                'OS__Neutron__Port': {
                    'type': 'property',
                    'property': 'port',
                    'limit': 1,
                },
                'OS__Neutron__Router': {
                    'type': 'property',
                    'property': 'router',
                    'limit': 1,
                },
                'OS__Neutron__Subnet': {
                    'type': 'property',
                    'property': 'subnet',
                    'limit': 1,
                },
            },
            necessary_properties: {
                'router': ['OS__Neutron__Router'],
            }
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronRouterInterfaceSettings', 'hotgenGlobals',function( osNeutronRouterInterfaceSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronRouterInterfaceSettings.resource_key,
            osNeutronRouterInterfaceSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronRouterInterfaceSettings.resource_key,
            osNeutronRouterInterfaceSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronRouterInterfaceSettings.resource_key,
            osNeutronRouterInterfaceSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronRouterInterfaceSettings.resource_key,
            osNeutronRouterInterfaceSettings.label);

    }]);

    function osNeutronRouterInterfaceController($scope, hotgenGlobals) {
        this.$onInit = function(){
            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }
            this.disable = {'port': false, 'router': false, 'subnet': false}
            $scope.update = {
                subnets: $scope.get_subnets_options(),
                routers: $scope.get_routers_options(),
                ports: $scope.get_ports_options(),
            }


            if ( $scope.connected_options.port && $scope.connected_options.port.length > 0){
                this.routerinterface['port'] = $scope.connected_options.port[0].value
                this.disable.port = true
            }
            if ( $scope.connected_options.router && $scope.connected_options.router.length > 0){
                this.routerinterface['router'] = $scope.connected_options.router[0].value
                this.disable.router = true
            }
            if ( $scope.connected_options.subnet && $scope.connected_options.subnet.length > 0){
                this.routerinterface['subnet'] = $scope.connected_options.subnet[0].value
                this.disable.subnet = true
            }
            $scope.dependson = this.dependson;
        }

        $scope.options = hotgenGlobals.get_resource_options();

        $scope.get_subnets_options = function(){
            if ('subnet' in $scope.connected_options){
                var resource_subnets = [];
                for (var idx in $scope.connected_options.subnet){
                    var item = $scope.connected_options.subnet[idx];
                    resource_subnets.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.subnets.concat(resource_subnets);
            }
            return $scope.options.subnets;
        }
        $scope.get_ports_options = function(){
            if ('port' in $scope.connected_options){
                var resource_ports = [];
                for (var idx in $scope.connected_options.port){
                    var item = $scope.connected_options.port[idx];
                    resource_ports.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.ports.concat(resource_ports);
            }
            return $scope.options.ports;
        }
        $scope.get_routers_options = function(){
            if ('router' in $scope.connected_options){
                var resource_routers = [];
                for (var idx in $scope.connected_options.router){
                    var item = $scope.connected_options.router[idx];
                    resource_routers.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.routers.concat(resource_routers);
            }
            return $scope.options.routers;
        }
    }

    osNeutronRouterInterfaceController.$inject = ['$scope', 'hotgenGlobals', ];
    osNeutronRouterInterfacePath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronRouterInterfacePath(basePath){
        return basePath + 'js/resources/os__neutron__routerinterface/os__neutron__routerinterface.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronRouterInterface', {
        templateUrl: osNeutronRouterInterfacePath,
        controller: osNeutronRouterInterfaceController,
        bindings:{
            'routerinterface': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });


})(window.angular);
