(function(angular) {
    'use strict';

    // OS::Designate::RecordSet
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osDesignateRecordsetSettings',
        {
            resource_key: "OS__Designate__RecordSet",
            admin: false,
            icon: {
                class: 'fa-key ',
                name: 'OS::Designate::RecordSet',
                code: '\uf084',
                color: '#483dff'
            },
            label: 'name',
            modal_component: '<os-designate-recordset recordset="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-designate-recordset>',
            edge_settings: {
                'OS__Designate__Zone': {
                    'type': 'property',
                    'property': 'zone',
                    'limit': 1,
                },
            },
            necessary_properties: {
                'name': null,
                'zone': ['OS__Designate__Zone'],
                'type': null,
                'records': null,
            },
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osDesignateRecordsetSettings', 'hotgenGlobals', function( osDesignateRecordsetSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osDesignateRecordsetSettings.resource_key,
            osDesignateRecordsetSettings.icon);

        hotgenGlobals.update_resource_components(
            osDesignateRecordsetSettings.resource_key,
            osDesignateRecordsetSettings.modal_component);

        hotgenGlobals.update_edge_directions(
            osDesignateRecordsetSettings.resource_key,
            osDesignateRecordsetSettings.edge_settings);

        hotgenGlobals.update_node_labels(
            osDesignateRecordsetSettings.resource_key,
            osDesignateRecordsetSettings.label);
    }]);


    function osDesignateRecordsetController($scope, hotgenGlobals, validationRules){
        $scope.options = hotgenGlobals.get_resource_options();

        $scope.options.types = [
            {'id': 'A', 'name': 'A'},
            {'id': 'AAAA', 'name': 'AAAA'},
            {'id': 'MX', 'name': 'MX'},
            {'id': 'CNAME', 'name': 'CNAME'},
            {'id': 'TXT', 'name': 'TXT'},
            {'id': 'SRV', 'name': 'SRV'},
            {'id': 'NS', 'name': 'NS'},
            {'id': 'PTR', 'name': 'PTR'},
            {'id': 'SPF', 'name': 'SPF'},
            {'id': 'SSHFP', 'name': 'SSHFP'},
        ];

        $scope.admin = $scope.options.auth.admin;
        this.$onInit = function(){
            if (typeof this.recordset.records === 'undefined'){
                this.recordset.records = [];
            }

            if (typeof this.connectedoptions === 'undefined'){
                $scope.connected_options = []
            } else{
                $scope.connected_options = this.connectedoptions;
            }

            this.disable = {'zone': false}

            if ( $scope.connected_options.zone && $scope.connected_options.zone.length > 0){
                this.recordset.zone = $scope.connected_options.zone[0].value
                this.disable.zone = true
            }
            $scope.dependson = this.dependson;
        }

        $scope.validate_name = validationRules['name'];
    }

    osDesignateRecordsetController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osDesignateRecordsetPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osDesignateRecordsetPath(basePath){
        return basePath + 'js/resources/os__designate__recordset/os__designate__recordset.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osDesignateRecordset', {
        templateUrl: osDesignateRecordsetPath,
        controller: osDesignateRecordsetController,
        bindings:{
            'recordset': '=',
            'dependson': '=',
            'connectedoptions': '<',
            'formReference': '<',
        }
    });

})(window.angular);
