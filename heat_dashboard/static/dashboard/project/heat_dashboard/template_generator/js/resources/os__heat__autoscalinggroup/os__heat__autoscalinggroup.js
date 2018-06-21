(function() {
    'use strict';

    /* OS::Heat::AutoScalingGroup
     *
     */

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .value('osHeatAutoScalingGroupSettings',
        {
            resource_key: "OS__Heat__AutoScalingGroup",
            admin: false,
            icon: {
                class: 'fa-hdd-o',
                name: 'OS::Heat::AutoScalingGroup',
                code: '\uf0a0',
                color: '#0bb238'
            },
            label: 'name',
            modal_component: '<os-heat-autoscalinggroup autoscalinggroup="resource" dependson="dependson" connectedoptions="connectedoptions" form-reference="resourceForm"></os-heat-autoscalinggroup>',
            edge_settings: null,
            necessary_properties: ['max_size', 'min_size', 'resource']
        }
    )

    // Register the resource to globals
    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .run(['osHeatAutoScalingGroupSettings','hotgenGlobals', function(osHeatAutoScalingGroupSettings, hotgenGlobals){
        hotgenGlobals.update_resource_icons(
            osHeatAutoScalingGroupSettings.resource_key ,
            osHeatAutoScalingGroupSettings.icon);

        hotgenGlobals.update_resource_components(
            osHeatAutoScalingGroupSettings.resource_key,
            osHeatAutoScalingGroupSettings.modal_component);

        hotgenGlobals.update_node_labels(
            osHeatAutoScalingGroupSettings.resource_key,
            osHeatAutoScalingGroupSettings.label);
    }]);


    // Define  <os-heat-autoscalinggroup> controller
    function osHeatAutoScalingGroupController($scope, hotgenGlobals, hotgenNotify, validationRules) {
        this.$onInit = function(){
            $scope.dependson = this.dependson;
            if (typeof this.autoscalinggroup.resource === 'undefined'){
                this.autoscalinggroup.resource = {'type': '', 'properties': [{}]};
            }
            if (typeof this.autoscalinggroup.rolling_updates === 'undefined'){
                this.autoscalinggroup.rolling_updates = {};
            }
            if (this.autoscalinggroup.resource.type){
                $scope.filecontent = hotgenGlobals.get_reference_file(this.autoscalinggroup.resource.type);
            }
        };

        $scope.validate_integer = validationRules['integer'];
        $scope.controller = this;
        $scope.resource_types = [];
        var resource_types = hotgenGlobals.get_resource_types();
        resource_types.forEach(function(element){
            $scope.resource_types.push(element.replace(/_/g, ':'));
        });
        $scope.options = hotgenGlobals.get_resource_options();
        $scope.update_upload = function(){
            if ($scope.controller.autoscalinggroup && $scope.controller.autoscalinggroup.resource && $scope.controller.autoscalinggroup.resource.type.indexOf('.yaml') != -1){
                return 'true';
            }
            return 'false';
        }

        $scope.is_upload = $scope.update_upload();

        $scope.$watch('is_upload', function(newValue, oldValue){
            if (oldValue === newValue){
                return;
            }
            if (newValue === true || newValue === 'true'){
                $scope.controller.autoscalinggroup.resource.properties = [{}];
                if (!($scope.filecontent && $scope.filecontent.length >= 0)){
                    $scope.controller.autoscalinggroup.resource.type = '';
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
                $scope.controller.autoscalinggroup.resource.type = file.name;
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
              angular.element('#resourcetype-file').trigger('click');
            }, 0);
        };
        this.delete_property = function(index){
            this.autoscalinggroup.resource.properties.splice(index, 1);

        }
        this.add_property = function(){
            this.autoscalinggroup.resource.properties.push({});
        }
    }

    function osHeatAutoScalingGroupPath (basePath){
        return  basePath + 'js/resources/os__heat__autoscalinggroup/os__heat__autoscalinggroup.html';
    }

    osHeatAutoScalingGroupController.$inject = ['$scope', 'hotgenGlobals', 'hotgenNotify',
        'horizon.dashboard.project.heat_dashboard.template_generator.validationRules',
    ];

    osHeatAutoScalingGroupPath.$inject = ['horizon.dashboard.project.heat_dashboard.template_generator.basePath'];

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
      .component('osHeatAutoscalinggroup', {
        templateUrl: osHeatAutoScalingGroupPath,
        controller: osHeatAutoScalingGroupController,
        bindings: {
          'autoscalinggroup': '=',
          'dependson': '=',
          'connectedoptions': '<',
          'formReference': '<',
        }
    });


})();
