(function(angular) {
    'use strict';


    // OS::Neutron::Subnet

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronSubnetSettings',
        {
            resource_key: "OS__Neutron__Subnet",
            admin: false,
            icon: {
                class: 'fa-cloud-upload ',
                name: 'OS::Neutron::Subnet',
                code: '\uf0ee',
                color: '#40a5f2'
            },
            label: 'name',
            modal_component: '<os-neutron-subnet subnet="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-neutron-subnet>',
            edge_settings: {
                'OS__Neutron__Net': {
                    'type': 'property',
                    'property': 'network',
                    'limit': 1,
                },
            },
            necessary_properties: {
                'network': ['OS__Neutron__Net']
            }
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronSubnetSettings', 'hotgenGlobals', function(osNeutronSubnetSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronSubnetSettings.resource_key,
            osNeutronSubnetSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronSubnetSettings.resource_key,
            osNeutronSubnetSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronSubnetSettings.resource_key,
            osNeutronSubnetSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronSubnetSettings.resource_key,
            osNeutronSubnetSettings.label);
    }]);


    function osNeutronSubnetController($scope, hotgenGlobals, hotgenNotify, validationRules) {

        this.$onInit = function(){
            this.admin = $scope.options.auth.admin;

            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }

            this.disable = {'network': false}
            $scope.networks = $scope.get_networks_options();

            if (typeof this.subnet.allocation_pools === 'undefined'){
                this.subnet.allocation_pools = [{}];
            }
            if (typeof this.subnet.host_routes === 'undefined'){
                this.subnet.host_routes = [{}];
            }
            if (typeof this.subnet.dns_nameservers === 'undefined'){
                this.subnet.dns_nameservers = [];
            }
            if ( $scope.connected_options.network && $scope.connected_options.network.length > 0){
                this.subnet['network'] = $scope.connected_options.network[0].value
                this.disable.network = true
            }
            $scope.dependson = this.dependson;

        }
        this.add_allocation_pool = function(){
            this.subnet.allocation_pools.push({})
        }
        this.delete_allocation_pool = function(index){
            this.subnet.allocation_pools.splice(index, 1)
        }
        this.add_hostroute = function(){
            this.subnet.host_routes.push({})
        }
        this.delete_hostroute = function(index){
            this.subnet.host_routes.splice(index, 1)
        }
        $scope.validate_dns = function (input_string){
            var re =  /^[A-Za-z0-9_.-]+$/;
            var match = re.exec(input_string);
            if (match){
                return input_string;
            } else{
                hotgenNotify.show_error('Invalid name server address.');
                return null;
            }
        }
        $scope.options = hotgenGlobals.get_resource_options();
        $scope.validate_name = validationRules['name'];
        $scope.validate_ip_address = validationRules['ip_address'];
        $scope.validate_cidr = validationRules['cidr'];
        $scope.validate_uuid4 = validationRules['uuid4'];
        $scope.validate_uuid_nohyphen = validationRules['uuid_nohyphen'];

        $scope.get_networks_options = function(){
            if ('network' in $scope.connected_options){
                var resource_nws = [];
                for (var idx in $scope.connected_options.network){
                    var item = $scope.connected_options.network[idx];
                    resource_nws.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.networks.concat(resource_nws);
            }
            return $scope.options.networks;
        }
    }

    osNeutronSubnetController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osNeutronSubnetPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronSubnetPath(basePath){
        return basePath + 'js/resources/os__neutron__subnet/os__neutron__subnet.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronSubnet', {
        templateUrl: osNeutronSubnetPath,
        controller: osNeutronSubnetController,
        bindings:{
            'subnet': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });


})(window.angular);
