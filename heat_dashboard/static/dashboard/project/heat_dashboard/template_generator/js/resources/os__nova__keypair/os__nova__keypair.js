(function(angular) {
    'use strict';

    // OS::Nova::KeyPair
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').value('osNovaKeypairSettings',
        {
            resource_key: "OS__Nova__KeyPair",
            admin: false,
            icon: {
                class: 'fa-key ',
                name: 'OS::Nova::KeyPair',
                code: '\uf084',
                color: '#483dff'
            },
            label: 'name',
            outputs: [
                {'property': 'private_key',
                }
            ],
            modal_component: '<os-nova-keypair keypair="resource" dependson="dependson" form-reference="resourceForm"></os-nova-keypair>',
            edge_settings: null,
            necessary_properties: {
                'name': null
            },
        }
    );

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .run(['osNovaKeypairSettings', 'hotgenGlobals', function( osNovaKeypairSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osNovaKeypairSettings.resource_key,
            osNovaKeypairSettings.icon);

        hotgenGlobals.update_resource_components(
            osNovaKeypairSettings.resource_key,
            osNovaKeypairSettings.modal_component);

        hotgenGlobals.update_node_labels(
            osNovaKeypairSettings.resource_key,
            osNovaKeypairSettings.label);

        hotgenGlobals.set_resource_outputs(
            osNovaKeypairSettings.resource_key,
            osNovaKeypairSettings.outputs);
    }]);


    function osNovaKeypairController($scope, hotgenGlobals, validationRules){
        $scope.options = hotgenGlobals.get_resource_options();

        $scope.admin = $scope.options.auth.admin;
        this.$onInit = function(){
            $scope.dependson = this.dependson;
        }
        $scope.validate_name = validationRules['name'];
        $scope.validate_keypair = validationRules['keypair'];


    }

    osNovaKeypairController.$inject = ['$scope', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];
    osNovaKeypairPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    function osNovaKeypairPath(basePath){
        return basePath + 'js/resources/os__nova__keypair/os__nova__keypair.html';
    }

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').component('osNovaKeypair', {
        templateUrl: osNovaKeypairPath,
        controller: osNovaKeypairController,
        bindings:{
            'keypair': '=',
            'dependson': '=',
            'formReference': '<',
        }
    });

})(window.angular);
