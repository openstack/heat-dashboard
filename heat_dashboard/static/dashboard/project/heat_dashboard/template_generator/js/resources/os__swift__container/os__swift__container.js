(function() {
    'use strict';
    var c_meta_key = "X-Container-Meta",
        a_meta_key = "X-Account-Meta",
        c_read_key = "X-Container-Read",
        c_write_key = "X-Container-Write",
        purge_key = "PurgeOnDelete";

    /**
     * OS::Swift::Container
     */
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .value('osSwiftContainerSettings',
        {
            resource_key: "OS__Swift__Container",
            admin: false,
            icon: {
                class: 'fa-archive ',
                name: 'OS::Swift::Container',
                code: '\uf0a0',
                color: '#0bb238'
            },
            label: 'name',
            modal_component: '<os-swift-container container="resource" form-reference="resourceForm"></os-swift-container>',
            edge_settings: null,
            necessary_properties: {
                name: null
            }
        }
    )

    // Register the resource to globals
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .run(['osSwiftContainerSettings','hotgenGlobals', function(osSwiftContainerSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osSwiftContainerSettings.resource_key ,
            osSwiftContainerSettings.icon);

        hotgenGlobals.update_resource_components(
            osSwiftContainerSettings.resource_key,
            osSwiftContainerSettings.modal_component);

        hotgenGlobals.update_node_labels(
            osSwiftContainerSettings.resource_key,
            osSwiftContainerSettings.label);
    }]);

    // Define  <os-swift-container> controller
    function osSwiftContainerController($scope, hotgenGlobals, hotgenNotify, validationRules) {
        this.$onInit = function(){
            // Initialize X-Container-Meta
            if (typeof this.container[c_meta_key] === 'undefined'){
                this.container[c_meta_key] = [{}];
            }
            // Initialize X-Account-Meta
            if (typeof this.container[a_meta_key] === 'undefined'){
                this.container[a_meta_key] = [{}];
            }
            // Intialize Purge On Delete
            if (typeof this.container[purge_key] === 'undefined'){
                this.container[purge_key] = false;
            }
        };

        $scope.options = hotgenGlobals.get_resource_options();
        $scope.show_more = false;
        $scope.validate_name = validationRules['name'];

        // Container Metadata manipulation functions
        this.add_x_container_meta = function(){
            this.container[c_meta_key].push({})
        }
        this.delete_x_container_meta = function(index){
            this.container[c_meta_key].splice(index, 1)
        }

        // Account Metadata manipulation functions
        this.add_x_account_meta = function(){
            this.container[a_meta_key].push({})
        }
        this.delete_x_account_meta = function(index){
            this.container[a_meta_key].splice(index, 1)
        }
    }

    function osSwiftContainerPath (basePath){
        return basePath + 'js/resources/os__swift__container/os__swift__container.html';
    }

    osSwiftContainerController.$inject = [
        '$scope',
        'hotgenGlobals',
        'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osSwiftContainerPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osSwiftContainer', {
        templateUrl: osSwiftContainerPath,
        controller: osSwiftContainerController,
        bindings: {
          'container': '=',
          'formReference': '<',
        }
    });
})();
