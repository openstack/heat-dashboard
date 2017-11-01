(function(angular) {
    'use strict';

    // OS::Neutron::Port

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNeutronPortSettings',
        {
            resource_key: "OS__Neutron__Port",
            admin: false,
            icon: {
                class: 'fa-genderless',
                name: 'OS::Neutron::Port',
                code: '\uf22d',
                color: '#40a5f2',
            },
            label: 'name',
            modal_component: '<os-neutron-port port="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-neutron-port>',
            edge_settings: {
                'OS__Neutron__Net': {
                    'type': 'property',
                    'property': 'network',
                    'limit': 1,
                },
                'OS__Neutron__Subnet': {
                    'type': 'complex',
                    'property': 'fixed_ips.subnet',
                    'limit': 99,
                },
                'OS__Neutron__SecurityGroup': {
                    'type': 'list',
                    'property': 'security_groups',
                    'limit': 99,
                },
            },
            necessary_properties: {
                'network': ['OS__Neutron__Net'],
            }
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNeutronPortSettings', 'hotgenGlobals',  function(osNeutronPortSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNeutronPortSettings.resource_key,
            osNeutronPortSettings.icon);

        hotgenGlobals.update_resource_components(
            osNeutronPortSettings.resource_key,
            osNeutronPortSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osNeutronPortSettings.resource_key,
            osNeutronPortSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osNeutronPortSettings.resource_key,
            osNeutronPortSettings.label);

    }]);

    function osNeutronPortController($scope, hotgenGlobals, validationRules){
        this.$onInit = function(){
            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }
            this.disable = {
                'network': false,
                'subnets': [],
                'security_groups': [],
            }

            if (typeof this.port.admin_state_up === 'undefined'){
                this.port.admin_state_up = true;
            }
            if (typeof this.port.binding === 'undefined'){
                this.port.binding = {'vnic_type': ''};
            }
            if (typeof this.port.allowed_address_pairs === 'undefined'){
                this.port.allowed_address_pairs = [{}];
            }
            if (typeof this.port.fixed_ips === 'undefined'){
                this.port.fixed_ips = [{}];
            }
            if (typeof this.port.security_groups === 'undefined'){
                this.port.security_groups = [];
            }
            if (typeof this.port.value_specs == 'undefined'){
                this.port.value_specs = [{}]
            }
            if (this.port.device_owner){
                this.searchText = this.port.device_owner;
            }

            if ( $scope.connected_options.network && $scope.connected_options.network.length > 0){
                this.port['network'] = $scope.connected_options.network[0].value;
                this.disable.network = true;
            }
            if ( $scope.connected_options.security_groups && $scope.connected_options.security_groups.length > 0){
                for (var idx in $scope.connected_options.security_groups){
                    this.port['security_groups'].push($scope.connected_options.security_groups[idx].value);
                    this.disable.security_groups.push($scope.connected_options.security_groups[idx].value);
                }
            }
            if ( $scope.connected_options['fixed_ips.subnet'] && $scope.connected_options['fixed_ips.subnet'].length > 0){
                for (var idx in $scope.connected_options['fixed_ips.subnet']){
                    this.port.fixed_ips.splice(0,0, {subnet: $scope.connected_options['fixed_ips.subnet'][idx].value});
                    this.disable.subnets.push($scope.connected_options['fixed_ips.subnet'][idx].value);
                }
            }

            $scope.update = {
                networks: $scope.get_networks_options(),
                security_groups: $scope.get_security_groups_options(),
                subnets: $scope.get_subnets_options(),
            }
            $scope.dependson = this.dependson;
        };

        $scope.options = hotgenGlobals.get_resource_options();
        $scope.show_more = false;
        $scope.validate_name = validationRules['name'];
        $scope.validate_mac_address = validationRules['mac_address'];
        $scope.validate_ip_address = validationRules['ip_address'];

        this.device_owners = load_device_owners();
        this.querySearch = querySearch;
        this.show_not_found = true;
        this.selectedItemChange = selectedItemChange;
        this.searchTextChange   = searchTextChange;

        $scope.get_networks_options = function(){
            if ('network' in $scope.connected_options){
                var resource_nw = [];
                for (var idx in $scope.connected_options.network){
                    var item = $scope.connected_options.network[idx];
                    resource_nw.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.networks.concat(resource_nw);
            }
            return $scope.options.networks;
        }

        $scope.get_security_groups_options = function(){
            if ('security_groups' in $scope.connected_options){
                var resource_secgroups = [];
                for (var idx in $scope.connected_options.security_groups){
                    var item = $scope.connected_options.security_groups[idx];
                    resource_secgroups.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.security_groups.concat(resource_secgroups);
            }
            return $scope.options.security_groups;
        }
        $scope.get_subnets_options = function(){
            if ('fixed_ips.subnet' in $scope.connected_options){
                var resource_subnets = [];
                for (var idx in $scope.connected_options['fixed_ips.subnet']){
                    var item = $scope.connected_options['fixed_ips.subnet'][idx];
                    resource_subnets.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.subnets.concat(resource_subnets);
            }
            return $scope.options.subnets;
        }

        $scope.qos_policies = $scope.options.qos_policies;


        this.add_value_specs = function(){
            this.port.value_specs.push({})
        }
        this.delete_value_specs = function(index){
            this.port.value_specs.splice(index, 1)
        }

        this.add_allowed_address_pair = function(){
            this.port.allowed_address_pairs.push({})
        }
        this.add_fixed_ip = function(){
            this.port.fixed_ips.push({})
        }
        this.delete_allowed_address_pair = function(index){
            this.port.allowed_address_pairs.splice(index, 1)
        }
        this.delete_fixed_ip = function(index){
            this.port.fixed_ips.splice(index, 1)
        }
        function searchTextChange(text) {
           this.port.device_owner = text;
        }

        function selectedItemChange(item) {
           this.port.device_owner = item.display;
        }

        function load_device_owners(){
            var all_device_owners = 'network:floatingip, network:router_interface, network:dhcp';
            return all_device_owners.split(/, +/g).map(function(dev_owner){
                return {
                    value: dev_owner.replace(/:/g, '_'),
                    display: dev_owner
                }
            });
        }

        function querySearch (query) {
            return query ? this.device_owners.filter( createFilterFor(query) ) : this.device_owners;
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query).replace(/:/g, '_');

          return function filterFn(dev_owner) {
            return (dev_owner.value.indexOf(lowercaseQuery) === 0);
          };
        }
    }

    osNeutronPortController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osNeutronPortPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNeutronPortPath(basePath){
        return basePath + 'js/resources/os__neutron__port/os__neutron__port.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNeutronPort', {
        templateUrl: osNeutronPortPath,
        controller: osNeutronPortController,
        bindings:{
            'port': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });

})(window.angular);
