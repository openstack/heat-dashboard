(function() {
    'use strict';

    /* OS::Cinder::Volume
     *
     */

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .value('osHeatResourceGroupSettings',
        {
            resource_key: "OS__Heat__ResourceGroup",
            admin: false,
            icon: {
                class: 'fa-server',
                name: 'OS::Heat::ResourceGroup',
                code: '\uf233',
                color: '#0bb238'
            },
            label: 'name',
            modal_component: '<os-heat-resource-group resourcegroup="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-heat-resource-group>',
            edge_settings: null,
            necessary_properties: null
        }
    );

    // Register the resource to globals
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .run(['osHeatResourceGroupSettings','hotgenGlobals', function(osHeatResourceGroupSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osHeatResourceGroupSettings.resource_key ,
            osHeatResourceGroupSettings.icon);

        hotgenGlobals.update_resource_components(
            osHeatResourceGroupSettings.resource_key,
            osHeatResourceGroupSettings.modal_component);

        hotgenGlobals.update_node_labels(
            osHeatResourceGroupSettings.resource_key,
            osHeatResourceGroupSettings.label);
    }]);

    function osHeatResourceGroupController ($scope, hotgenGlobals, hotgenNotify, validationRules) {
        this.$onInit = function(){
            if (typeof this.resourcegroup.resource_def === 'undefined'){
                this.resourcegroup.resource_def = {'type': '', 'properties': [{}], 'metadata': []};
            }
            $scope.dependson = this.dependson;
            if (this.resourcegroup.resource_def.type){
                $scope.filecontent = hotgenGlobals.get_reference_file(this.resourcegroup.resource_def.type);
            }
        };
        $scope.controller = this;
        $scope.resource_types = [];
        var resource_types = hotgenGlobals.get_resource_types();
        resource_types.forEach(function(element){
            $scope.resource_types.push(element.replace(/_/g, ':'));
        });

        $scope.update_upload = function(){
            if ($scope.controller.resourcegroup && $scope.controller.resourcegroup.resource_def && $scope.controller.resourcegroup.resource_def.type.indexOf('.yaml') != -1){
                return 'true';
            }
            return 'false';
        }

        $scope.is_upload = $scope.update_upload();
        $scope.show_more = false;

        $scope.$watch('is_upload', function(newValue, oldValue){
            if (oldValue === newValue){
                return;
            }
            if (newValue === true || newValue === 'true'){
                $scope.controller.resourcegroup.resource_def.properties = [{}];
                if (!($scope.filecontent && $scope.filecontent.length >= 0)){
                    $scope.controller.resourcegroup.resource_def.type = '';
                }
            } else{
            //  ;
            }
        });
        $scope.file_upload = function(element){
            var file = element.files[0];
            if (!file){
                return;
            }
            var textType = /\.yaml$/;
            if (file.name.match(textType)) {
                var reader = new FileReader();
                $scope.controller.resourcegroup.resource_def.type = file.name;
                reader.onload = function(e) {
                    hotgenNotify.show_success('Read file content.');
                    hotgenGlobals.set_reference_file(file.name, reader.result)
                    $scope.filecontent = reader.result;
                }
                reader.readAsText(file);
           } else {
               hotgenNotify.show_error('File type is not supported.');
           }
        }
        $scope.clickUpload = function(){
            setTimeout(function () {
              angular.element('#resourceref-file').trigger('click');
            }, 0);
        };
        this.delete_property = function(index){
            this.resourcegroup.resource_def.properties.splice(index, 1);

        }
        this.add_property = function(){
            this.resourcegroup.resource_def.properties.push({});
        }

        this.delete_metadata = function(index){
            this.resourcegroup.resource_def.metadata.splice(index, 1);

        }
        this.add_metadata = function(){
            this.resourcegroup.resource_def.metadata.push({});
        }

    }

    function osHeatResourceGroupPath (basePath){
        return  basePath + 'js/resources/os__heat__resourcegroup/os__heat__resourcegroup.html';
    }

    osHeatResourceGroupController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osHeatResourceGroupPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osHeatResourceGroup', {
        templateUrl: osHeatResourceGroupPath,
        controller: osHeatResourceGroupController,
        bindings: {
          'resourcegroup': '=',
          'dependson': '=',
          'connectedoptions': '<',
          'formReference': '<',
        }
    });

})();
