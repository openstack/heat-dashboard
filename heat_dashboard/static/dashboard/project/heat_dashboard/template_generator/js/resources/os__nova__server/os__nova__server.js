(function(angular) {
    'use strict';


    // OS::Nova::Server


    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNovaServerSettings',
        {
            resource_key: "OS__Nova__Server",
            admin: false,
            icon: {
                class: 'fa-desktop ',
                name: 'OS::Nova::Server',
                code: '\uf108',
                color: '#483dff'
            },
            label: 'name',
            modal_component: '<os-nova-server instance="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-nova-server>',
            edge_settings: {
                'OS__Cinder__Volume': {
                    'type': 'property',
                    'property': 'block_device_mapping_v2.volume_id',
                    'limit': 99,
                    'occupied': true,
                    'lonely': true,
                   },
                'OS__Nova__KeyPair': {
                    'type': 'property',
                    'property': 'key_name',
                    'limit': 1,
                },
                'OS__Neutron__Net': {
                    'type': 'property',
                    'property': 'networks.network',
                    'limit': 99,
                },
                'OS__Neutron__FloatingIP': {
                    'type': 'property',
                    'property': 'networks.floating_ip',
                    'limit': 99,
                },
                'OS__Neutron__Subnet': {
                    'type': 'property',
                    'property': 'networks.subnet',
                    'limit': 99,
                },
                'OS__Neutron__Port': {
                    'type': 'property',
                    'property': 'networks.port',
                    'limit': 99,
                },
                'OS__Neutron__SecurityGroup': {
                    'type': 'property',
                    'property': 'security_groups',
                    'limit': 99,
                },
            },
            necessary_properties: {
                'flavor': null
            }
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNovaServerSettings', 'hotgenGlobals', function(osNovaServerSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNovaServerSettings.resource_key,
            osNovaServerSettings.icon);

        hotgenGlobals.update_node_labels(
            osNovaServerSettings.resource_key,
            osNovaServerSettings.label);

        hotgenGlobals.update_resource_components(
            osNovaServerSettings.resource_key,
            osNovaServerSettings.modal_component);

//        for (var i in osNovaServerSettings.edge_settings){
//            if (osNovaServerSettings.edge_settings[i].modal){
//                hotgenGlobals.update_resource_components(
//                    osNovaServerSettings.resource_key+'_'+i,
//                    osNovaServerSettings.edge_settings[i].modal);
//            }
//        }

        hotgenGlobals.update_edge_directions(
            osNovaServerSettings.resource_key,
            osNovaServerSettings.edge_settings);

    }]);

    function osNovaServerController($scope, hotgenGlobals, hotgenNotify, hotgenUtils, validationRules) {
        this.$onInit = function(){
            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }
            if (typeof this.instance.metadata === 'undefined'){
                this.instance.metadata = [{}];
            }
            if (typeof this.instance.tags === 'undefined'){
                this.instance.tags = [];
            }
            if (typeof this.instance.scheduler_hints === 'undefined'){
                this.instance.scheduler_hints = [{}];
            }
            if (typeof this.instance.personality === 'undefined'){
                this.instance.personality = [{}];
            }
            if (typeof this.instance.block_device_mapping === 'undefined'){
                this.instance.block_device_mapping = [];
            }
            if (typeof this.instance.security_groups === 'undefined'){
                this.instance.security_groups = [];
            }
            if (typeof this.instance.block_device_mapping_v2 === 'undefined'){
                this.instance.block_device_mapping_v2 = [];
            }
            if (typeof this.instance.networks === 'undefined'){
                this.instance.networks = [];
            }

            this.disable = {
                'key_name': false,
                'security_groups': [],
                'block_device_mapping_v2.volume_id': [],
                'networks': {},
            }

            if (this.instance.image){
                $scope.boot_source = 'image';
            } else if (this.instance.image_snapshot){
                $scope.boot_source = 'image_snapshot';
            } else if (this.instance.volume){
                $scope.boot_source = 'volume';
            } else if (this.instance.volume_snapshot){
                $scope.boot_source = 'volume_snapshot';
            }

            if ( $scope.connected_options.key_name && $scope.connected_options.key_name.length > 0){
                this.instance['key_name'] = $scope.connected_options.key_name[0].value;
                this.disable.key_name = true;
            }

            var old_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['security_groups']);
            if ( $scope.connected_options.security_groups && $scope.connected_options.security_groups.length > 0){
                for (var idx in $scope.connected_options.security_groups){
                    this.instance['security_groups'].push($scope.connected_options.security_groups[idx].value);
                    this.disable.security_groups.push($scope.connected_options.security_groups[idx].value);
                }
            }

            var old_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['block_device_mapping_v2'], 'volume_id');
            var exist_volume_map = {}
            for (var idx in old_array){
                if (old_array[idx].volume_id && old_array[idx].volume_id.length > 0 ){
                    exist_volume_map[old_array[idx].volume_id] = old_array[idx];
                }
            }
            this.disable.length = 0;
            $scope.bdpv2_source = {};
            if ( $scope.connected_options['block_device_mapping_v2.volume_id'] && $scope.connected_options['block_device_mapping_v2.volume_id'].length > 0){
                for (var idx in $scope.connected_options['block_device_mapping_v2.volume_id']){
                    var connected_vol_id = $scope.connected_options['block_device_mapping_v2.volume_id'][idx].value;
                    var item = exist_volume_map[connected_vol_id];
                    if (item == null){
                        item = {volume_id: connected_vol_id}
                    }
                    this.instance.block_device_mapping_v2.push(item);
                    this.disable['block_device_mapping_v2.volume_id'].push(connected_vol_id);
                }
            }
            for (var idx in this.instance.block_device_mapping_v2){
                var disk = this.instance.block_device_mapping_v2[idx];
                var source = '';
                if (disk.volume_id && disk.volume_id != '') {
                    source = 'volume';
                } else if (disk.image && disk.image != '') {
                    source = 'image';
                } else if (disk.snapshot_id && disk.snapshot_id != '') {
                    source = 'volume_snapshot';
                }
                $scope.bdpv2_source[idx.toString()] = source;
            }

            var old_net_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['networks'], 'network');
            var exist_network_map = {}
            for (var idx in old_net_array){
                if (old_net_array[idx].network && old_net_array[idx].network.length > 0 ){
                    exist_network_map[old_net_array[idx].network] = old_net_array[idx];
                }
            }

            var old_subnet_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['networks'], 'subnet');
            var exist_subnet_map = {}
            for (var idx in old_subnet_array){
                if (old_subnet_array[idx].subnet && old_subnet_array[idx].subnet.length > 0 ){
                    exist_subnet_map[old_subnet_array[idx].subnet] = old_subnet_array[idx];
                }
            }

            var old_port_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['networks'], 'port');
            var exist_port_map = {}
            for (var idx in old_port_array){
                if (old_port_array[idx].port && old_port_array[idx].port.length > 0 ){
                    exist_port_map[old_port_array[idx].port] = old_port_array[idx];
                }
            }

            var old_fip_array = hotgenUtils.filter_and_return_get_resource_element(this.instance['networks'], 'floating_ip');
            var exist_fip_map = {}
            for (var idx in old_fip_array){
                if (old_fip_array[idx].floating_ip && old_fip_array[idx].floating_ip.length > 0 ){
                    exist_fip_map[old_fip_array[idx].floating_ip] = old_fip_array[idx];
                }
            }

            if ( $scope.connected_options['networks.network'] && $scope.connected_options['networks.network'].length > 0){
                for (var idx in $scope.connected_options['networks.network']){
                    var connected_nw_id = $scope.connected_options['networks.network'][idx].value;
                    var item = exist_network_map[connected_nw_id];
                    if (item == null){
                        item = {network: connected_nw_id}
                    }
                    this.disable.networks[this.instance.networks.length.toString()] = true;
                    $scope.how2config_networks[this.instance.networks.length.toString()] = 'network';
                    this.instance.networks.push(item);
                }
            }

            if ( $scope.connected_options['networks.subnet'] && $scope.connected_options['networks.subnet'].length > 0){
                for (var idx in $scope.connected_options['networks.subnet']){
                    var connected_subnet_id = $scope.connected_options['networks.subnet'][idx].value;
                    var item = exist_subnet_map[connected_subnet_id];
                    if (item == null){
                        item = {subnet: connected_subnet_id}
                    }
                    this.disable.networks[this.instance.networks.length] = true;
                    $scope.how2config_networks[this.instance.networks.length.toString()] = 'subnet';
                    this.instance.networks.push(item);
                }
            }

            if ( $scope.connected_options['networks.port'] && $scope.connected_options['networks.port'].length > 0){
                for (var idx in $scope.connected_options['networks.port']){
                    var connected_port_id = $scope.connected_options['networks.port'][idx].value;
                    var item = exist_port_map[connected_port_id];
                    if (item == null){
                        item = {port: connected_port_id}
                    }
                    this.disable.networks[this.instance.networks.length] = true;
                    $scope.how2config_networks[this.instance.networks.length.toString()] = 'port';
                    this.instance.networks.push(item);
                }
            }


            if ( $scope.connected_options['networks.floating_ip'] && $scope.connected_options['networks.floating_ip'].length > 0){
                for (var idx in $scope.connected_options['networks.floating_ip']){
                    var connected_fip_id = $scope.connected_options['networks.floating_ip'][idx].value;
                    var item = exist_fip_map[connected_fip_id];
                    if (item == null){
                        item = {floating_ip: connected_fip_id}
                    }
                    this.disable.networks[this.instance.networks.length] = true;
                    $scope.how2config_networks[this.instance.networks.length.toString()] = 'floating_ip';
                    this.instance.networks.push(item);
                }
            }
            for (var idx in this.instance.networks){
                var netconfig = this.instance.networks[idx];
                var source = '';
                if (netconfig.network && netconfig.network != '') {
                    source = 'network';
                } else if (netconfig.subnet && netconfig.subnet != '') {
                    source = 'subnet';
                } else if (netconfig.port && netconfig.port != '') {
                    source = 'port';
                } else if (netconfig.floating_ip && netconfig.floating_ip != '') {
                    source = 'floating_ip';
                }
                $scope.how2config_networks[idx.toString()] = source;
            }

            $scope.update = {
                keypairs: $scope.get_keypairs_options(),
                networks: $scope.get_networks_options(),
                subnets: $scope.get_subnets_options(),
                floatingips: $scope.get_floatingips_options(),
                ports: $scope.get_ports_options(),
                security_groups: $scope.get_security_groups_options(),
                volumes: $scope.get_volumes_options(),
            }

            $scope.dependson = this.dependson;
        }
        $scope.show_passwd = false;
        $scope.show_passwd_type = "password";
        $scope.bdpv2_source = {}; // Mark the source selected of every block_device_mapping_v2 item.
        $scope.how2config_networks = {}
        $scope.update_boot_source = function(){
            if ($scope.boot_source == 'image'){
                this.$ctrl.instance.image_snapshot = null;
                this.$ctrl.instance.volume = null;
                this.$ctrl.instance.volume_snapshot = null;
            } else if ($scope.boot_source == 'image_snapshot'){
                this.$ctrl.instance.image = null;
                this.$ctrl.instance.volume = null;
                this.$ctrl.instance.volume_snapshot = null;
            } else if ($scope.boot_source == 'volume'){
                this.$ctrl.instance.image = null;
                this.$ctrl.instance.image_snapshot = null;
                this.$ctrl.instance.volume_snapshot = null;
            } else if ($scope.boot_source == 'volume_snapshot'){
                this.$ctrl.instance.image = null;
                this.$ctrl.instance.image_snapshot = null;
                this.$ctrl.instance.volume = null;
            }
        }
        $scope.update_source = function (index) {
                if ($scope.bdpv2_source[index] == 'volume'){
                    this.$ctrl.instance.block_device_mapping_v2[index].image = null;
                    this.$ctrl.instance.block_device_mapping_v2[index].snapshot_id = null;
                } else if ($scope.bdpv2_source[index] == 'volume_snapshot'){
                    this.$ctrl.instance.block_device_mapping_v2[index].volume_id = null;
                    this.$ctrl.instance.block_device_mapping_v2[index].image = null;
                } else if ($scope.bdpv2_source[index] == 'image'){
                    this.$ctrl.instance.block_device_mapping_v2[index].volume_id = null;
                    this.$ctrl.instance.block_device_mapping_v2[index].snapshot_id = null;
                }
        }
        $scope.update_nwconfig = function (index) {
                if ($scope.how2config_networks[index] == 'network'){
                    this.$ctrl.instance.networks[index].subnet = null;
                    this.$ctrl.instance.networks[index].port = null;
                    this.$ctrl.instance.networks[index].floating_ip = null;
                } else if ($scope.how2config_networks[index] == 'subnet'){
                    this.$ctrl.instance.networks[index].network = null;
                    this.$ctrl.instance.networks[index].port = null;
                    this.$ctrl.instance.networks[index].floating_ip = null;
                } else if ($scope.how2config_networks[index] == 'port'){
                    this.$ctrl.instance.networks[index].subnet = null;
                    this.$ctrl.instance.networks[index].network = null;
                    this.$ctrl.instance.networks[index].floating_ip = null;
                } else if ($scope.how2config_networks[index] == 'floating_ip'){
                    this.$ctrl.instance.networks[index].subnet = null;
                    this.$ctrl.instance.networks[index].port = null;
                    this.$ctrl.instance.networks[index].network = null;
                }
        }
        $scope.$watch("show_passwd", function(newValue, oldValue) {
            $scope.show_passwd_type = $scope.show_passwd ? "text" : "password";
        });


        $scope.options = hotgenGlobals.get_resource_options();

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

        $scope.get_volumes_options = function(){
            if ('block_device_mapping_v2.volume_id' in $scope.connected_options){
                var resource_volumes = [];
                for (var idx in $scope.connected_options['block_device_mapping_v2.volume_id']){
                    var item = $scope.connected_options['block_device_mapping_v2.volume_id'][idx];
                    resource_volumes.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.volumes.concat(resource_volumes);
            }
            return $scope.options.volumes;
        }

        $scope.get_keypairs_options = function(){
            if ('key_name' in $scope.connected_options){
                var resource_keypair = [];
                for (var idx in $scope.connected_options.key_name){
                    var item = $scope.connected_options.key_name[idx];
                    resource_keypair.push({
                        name: item.value
                    })
                }
                return $scope.options.keypairs.concat(resource_keypair);
            }
            return $scope.options.keypairs;
        }

        $scope.get_networks_options = function(){
            if ('networks.network' in $scope.connected_options){
                var resource_nw = [];
                for (var idx in $scope.connected_options['networks.network']){
                    var item = $scope.connected_options['networks.network'][idx];
                    resource_nw.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.networks.concat(resource_nw);
            }
            return $scope.options.networks;
        }
        $scope.get_subnets_options = function(){
            if ('networks.subnet' in $scope.connected_options){
                var resource_subnet = [];
                for (var idx in $scope.connected_options['networks.subnet']){
                    var item = $scope.connected_options['networks.subnet'][idx];
                    resource_subnet.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.subnets.concat(resource_subnet);
            }
            return $scope.options.subnets;
        }
        $scope.get_floatingips_options = function(){
            if ('networks.floating_ip' in $scope.connected_options){
                var resource_fip = [];
                for (var idx in $scope.connected_options['networks.floating_ip']){
                    var item = $scope.connected_options['networks.floating_ip'][idx];
                    resource_fip.push({
                        id: item.value,
                    })
                }
                return $scope.options.floatingips.concat(resource_fip);
            }
            return $scope.options.floatingips;
        }
        $scope.get_ports_options = function(){
            if ('networks.port' in $scope.connected_options){
                var resource_port = [];
                for (var idx in $scope.connected_options['networks.port']){
                    var item = $scope.connected_options['networks.port'][idx];
                    resource_port.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.ports.concat(resource_port);
            }
            return $scope.options.ports;
        }

        $scope.block_device_mapping_v2 = true;
        $scope.deployment_swift_data = {};
        $scope.show_more = false;

        $scope.options.boot_sources = [
            {'id': 'image', 'name': 'image'},
            {'id': 'image_snapshot', 'name': 'image snapshot'},
            {'id': 'volume', 'name': 'volume'},
            {'id': 'volume_snapshot', 'name': 'volume snapshot'}
        ];
        $scope.options.volume_sources = [
            {'id': 'volume', 'name': 'volume'},
            {'id': 'volume_snapshot', 'name': 'volume snapshot'}
        ];
        $scope.options.volume_sources_v2 = [
            {'id': 'image', 'name': 'image'},
            {'id': 'volume', 'name': 'volume'},
            {'id': 'volume_snapshot', 'name': 'volume snapshot'}
        ];

        $scope.options.flavor_update_policies = [
                {'name': 'RESIZE', 'default': true},
                {'name': 'REPLACE'},
        ];
        $scope.options.image_update_policies = [
                {'name': 'REBUILD', 'default': true},
                {'name': 'REPLACE'},
                {'name': 'REBUILD_PRESERVE_EPHEMERAL'},
        ];
        $scope.options.disk_configs = [
                {'name': 'AUTO', 'default': true},
                {'name': 'MANUAL'},
        ];
        $scope.options.software_config_transports = [
                {'name': 'POLL_SERVER_CFN', 'default': true},
                {'name': 'POLL_SERVER_HEAT'},
                {'name': 'POLL_TEMP_URL'},
                {'name': 'ZAQAR_MESSAGE'},
        ];
        $scope.options.user_data_update_policies = [
                {'name': 'REPLACE', 'default': true},
                {'name': 'IGNORE'},
        ];
        $scope.options.user_data_formats = [
                {'name': 'HEAT_CFNTOOLS', 'default': true},
                {'name': 'RAW'},
                {'name': 'SOFTWARE_CONFIG'}
        ];
        $scope.options.disk_types = [
                {'name': 'disk'},
                {'name': 'cdrom'},
        ]
        $scope.options.disk_buses = [
                {'name': 'ide'},
                {'name': 'lame_bus'},
                {'name': 'scsi'},
                {'name': 'usb'},
                {'name': 'virtio'},
        ];
        $scope.options.ephemeral_formats = [
                {'name': 'ext2'},
                {'name': 'ext3'},
                {'name': 'ext4'},
                {'name': 'xfs'},
                {'name': 'ntfs'},
        ];
        $scope.options.allocate_networks = [{'name': 'none'}, {'name': 'auto'}];

        $scope.validate_name = validationRules['name'];
        $scope.validate_ip_address = validationRules['ip_address'];
        $scope.validate_uuid4 = validationRules['uuid4'];


        this.delete_metadata = function(index){
            this.instance.metadata.splice(index, 1)
        }
        this.add_metadata = function(){
            this.instance.metadata.push({})
        }
        this.delete_personality = function(index){
            this.instance.personality.splice(index, 1)
        }
        this.add_personality = function(){
            this.instance.personality.push({})
        }
        this.delete_block_device_mapping = function(index){
            this.instance.block_device_mapping.splice(index, 1)
        }
        this.add_block_device_mapping = function(){
            this.instance.block_device_mapping.push({})
        }
        this.delete_block_device_mapping_v2 = function(index){
            for (var i = index; i <= this.instance.block_device_mapping_v2.length; i=i+1){
                $scope.bdpv2_source[i] = $scope.bdpv2_source[i+1];
            }
            this.instance.block_device_mapping_v2.splice(index, 1)
        }
        this.add_block_device_mapping_v2 = function(){
            this.instance.block_device_mapping_v2.push({})
        }
        this.delete_networks = function(index){
            for (var i = index; i < this.instance.networks.length; i=i+1){
                $scope.how2config_networks[i] = $scope.how2config_networks[i+1];
            }
            delete $scope.how2config_networks[this.instance.networks.length];
            this.instance.networks.splice(index, 1);
            for (var i = index; i < this.instance.networks.length; i=i+1){
                this.disable.networks[i] = this.disable.networks[i+1];
            }
            delete this.disable.networks[this.instance.networks.length];
        }
        this.add_networks = function(){
            this.instance.networks.push({})
        }
        this.delete_scheduler_hints = function(index){
            this.instance.scheduler_hints.splice(index, 1)
        }
        this.add_scheduler_hints= function(){
            this.instance.scheduler_hints.push({})
        }
    }

    osNovaServerController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify', 'hotgenUtils',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osNovaServerPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];


    function osNovaServerPath(basePath){
        return basePath + 'js/resources/os__nova__server/os__nova__server.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNovaServer', {
        templateUrl: osNovaServerPath,
        controller: osNovaServerController,
        bindings:{
            'instance': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });

})(window.angular);
