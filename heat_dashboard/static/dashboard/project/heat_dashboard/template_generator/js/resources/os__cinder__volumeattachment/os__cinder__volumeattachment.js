(function() {
    'use strict';

    /* OS::Cinder::VolumeAttachment
     *
     */


    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osCinderVolumeAttachmentSettings',
        {
            resource_key: "OS__Cinder__VolumeAttachment",
            admin: false,
            icon: {
                class: 'fa-plug',
                name: 'OS::Cinder::VolumeAttachment',
                code: '\uf1e6',
                color: '#0bb238'
            },
            label: 'mountpoint',
            modal_component: '<os-cinder-volume-attachment volumeattachment="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-cinder-volume-attachment>',
            edge_settings: {
                'OS__Cinder__Volume': {
                    'type': 'property',
                    'property': 'volume_id',
                    'limit': 1,
                    'occupied': false, //* whether can be connected to any other resource */
                    'lonely': false,  //* whether can be connected  to one more  other resource */
                    'handler': osCinderVolumeAttachmentController.handle_edge_volume_id,
                    'modal': null
                },
                'OS__Nova__Server': {
                    'type': 'property',
                    'property': 'instance_uuid',
                    'limit': 1,
                    'occupied': false,
                    'handler': osCinderVolumeAttachmentController.handle_edge_instance_uuid,
                    'modal': null
                },
            },
            necessary_properties: {
                'instance_uuid': ['OS__Nova__Server',],
                'volume_id': ['OS__Cinder__Volume',]
            }
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osCinderVolumeAttachmentSettings', 'hotgenGlobals', function(osCinderVolumeAttachmentSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osCinderVolumeAttachmentSettings.resource_key,
            osCinderVolumeAttachmentSettings.icon);

        hotgenGlobals.update_node_labels(
            osCinderVolumeAttachmentSettings.resource_key,
            osCinderVolumeAttachmentSettings.label);

        hotgenGlobals.update_resource_components(
            osCinderVolumeAttachmentSettings.resource_key,
            osCinderVolumeAttachmentSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osCinderVolumeAttachmentSettings.resource_key,
            osCinderVolumeAttachmentSettings.edge_settings);

    }]);


    // Define  <os-cinder-volume> controller
    function osCinderVolumeAttachmentController($scope, hotgenGlobals, validationRules){
        this.$onInit = function(){
            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }
            this.disable = {'instance_uuid': false, 'volume_id': false}
            $scope.update = {
                volumes: $scope.get_volume_id_options(),
                instances: $scope.get_instance_uuid_options()
            }

            if ( $scope.connected_options.instance_uuid && $scope.connected_options.instance_uuid.length > 0){
                this.volumeattachment['instance_uuid'] = $scope.connected_options.instance_uuid[0].value
                this.disable.instance_uuid = true
            }
            if ( $scope.connected_options.volume_id && $scope.connected_options.volume_id.length > 0){
                this.volumeattachment['volume_id'] = $scope.connected_options.volume_id[0].value
                this.disable.volume_id = true
            }
            $scope.dependson = this.dependson;
        }

        $scope.options = hotgenGlobals.get_resource_options();
        $scope.validatePath = validationRules['path'];

        $scope.get_volume_id_options = function(){
            if ('volume_id' in $scope.connected_options){
                var resource_volumes = [];
                for (var idx in $scope.connected_options.volume_id){
                    var item = $scope.connected_options.volume_id[idx];
                    resource_volumes.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.volumes.concat(resource_volumes);
            }
            return $scope.options.volumes;
        }
        $scope.get_instance_uuid_options = function(){
            if ('instance_uuid' in $scope.connected_options){
                var resource_instances = [];
                for (var idx in $scope.connected_options.instance_uuid){
                    var item = $scope.connected_options.instance_uuid[idx];
                    resource_instances.push({
                        id: item.value,
                        name: item.value
                    })
                }
                return $scope.options.instances.concat(resource_instances);
            }
            return $scope.options.instances;
        }
    }

    osCinderVolumeAttachmentController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',];
    osCinderVolumeAttachmentPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osCinderVolumeAttachmentPath (basePath){
        return  basePath + 'js/resources/os__cinder__volumeattachment/os__cinder__volumeattachment.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osCinderVolumeAttachment', {
        templateUrl: osCinderVolumeAttachmentPath,
        controller: osCinderVolumeAttachmentController,
        bindings:{
            'volumeattachment': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });

})();
