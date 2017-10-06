(function() {
    'use strict';

    /* OS::Cinder::Volume
     *
     */

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .value('osCinderVolumeSettings',
        {
            resource_key: "OS__Cinder__Volume",
            admin: false,
            icon: {
                class: 'fa-hdd-o',
                name: 'OS::Cinder::Volume',
                code: '\uf0a0',
                color: '#0bb238'
            },
            label: 'name',
            modal_component: '<os-cinder-volume volume="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-cinder-volume>',
            edge_settings: null,
            necessary_properties: null
        }
    )

    // Register the resource to globals
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .run(['osCinderVolumeSettings','hotgenGlobals', function(osCinderVolumeSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osCinderVolumeSettings.resource_key ,
            osCinderVolumeSettings.icon);

        hotgenGlobals.update_resource_components(
            osCinderVolumeSettings.resource_key,
            osCinderVolumeSettings.modal_component);

        hotgenGlobals.update_node_labels(
            osCinderVolumeSettings.resource_key,
            osCinderVolumeSettings.label);
    }]);


    // Define  <os-cinder-volume> controller
    function osCinderVolumeController($scope, hotgenGlobals, hotgenNotify, validationRules) {
        this.$onInit = function(){
            if (typeof this.volume.metadata === 'undefined'){
                this.volume.metadata = [{}];
            }
            if (typeof this.volume.scheduler_hints === 'undefined'){
                this.volume.scheduler_hints = [{}];
            }
            $scope.dependson = this.dependson;
        };

        $scope.boot_sources = [
            {'id': 'image', 'name': 'image'},
            {'id': 'volume', 'name': 'volume'},
            {'id': 'volume_snapshot', 'name': 'volume snapshot'},
            {'id': 'backup', 'name': 'backup'},
        ];
        $scope.options = hotgenGlobals.get_resource_options();
        $scope.show_more = false;
        $scope.validate_name = validationRules['name'];

        this.delete_metadata = function(index){
            this.volume.metadata.splice(index, 1)

        }
        this.add_metadata = function(){
            this.volume.metadata.push({})
        }
        this.delete_scheduler_hints = function(index){
            this.volume.scheduler_hints.splice(index, 1)

        }
        this.add_scheduler_hints= function(){
            this.volume.scheduler_hints.push({})
        }
    }

    function osCinderVolumePath (basePath){
        return  basePath + 'js/resources/os__cinder__volume/os__cinder__volume.html';
    }

    osCinderVolumeController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osCinderVolumePath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osCinderVolume', {
        templateUrl: osCinderVolumePath,
        controller: osCinderVolumeController,
        bindings: {
          'volume': '=',
          'dependson': '=',
          'connectedoptions': '<',
          'formReference': '<',
        }
    });


})();
