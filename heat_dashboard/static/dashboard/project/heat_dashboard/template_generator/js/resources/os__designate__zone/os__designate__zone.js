(function(angular) {
    'use strict';

    // OS::Designate::Zone
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osDesignateZoneSettings',
        {
            resource_key: "OS__Designate__Zone",
            admin: false,
            icon: {
                class: 'fa-key ',
                name: 'OS::Designate::Zone',
                code: '\uf084',
                color: '#483dff'
            },
            label: 'name',
            modal_component: '<os-designate-zone zone="resource" dependson="dependson" form-reference="resourceForm"></os-designate-zone>',
            edge_settings: null,
            necessary_properties: {
                'name': null,
                'email': null
            },
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osDesignateZoneSettings', 'hotgenGlobals', function( osDesignateZoneSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osDesignateZoneSettings.resource_key,
            osDesignateZoneSettings.icon);

        hotgenGlobals.update_resource_components(
            osDesignateZoneSettings.resource_key,
            osDesignateZoneSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osDesignateZoneSettings.resource_key,
            osDesignateZoneSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osDesignateZoneSettings.resource_key,
            osDesignateZoneSettings.label);
    }]);


    function osDesignateZoneController($scope, hotgenGlobals, hotgenNotify, validationRules){
        $scope.options = hotgenGlobals.get_resource_options();

        $scope.options.types = [
            {'id': 'PRIMARY', 'name': 'PRIMARY'},
            {'id': 'SECONDARY', 'name': 'SECONDARY'}
        ];

        $scope.admin = $scope.options.auth.admin;
        this.$onInit = function(){
            if (typeof this.zone.masters === 'undefined'){
                this.zone.masters = [];
            }
            $scope.dependson = this.dependson;
        }

        $scope.validate_zone = validationRules['zone'];

        $scope.validate_master = function (input_string){
            var re =  /^[A-Za-z0-9_.-]+$/;
            var match = re.exec(input_string);
            if (match){
                return input_string;
            } else{
                hotgenNotify.show_error('Invalid master value.');
                return null;
            }
        }
    }

    osDesignateZoneController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osDesignateZonePath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osDesignateZonePath(basePath){
        return basePath + 'js/resources/os__designate__zone/os__designate__zone.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osDesignateZone', {
        templateUrl: osDesignateZonePath,
        controller: osDesignateZoneController,
        bindings:{
            'zone': '=',
            'dependson': '=',
            'formReference': '<',
        }
    });

})(window.angular);
