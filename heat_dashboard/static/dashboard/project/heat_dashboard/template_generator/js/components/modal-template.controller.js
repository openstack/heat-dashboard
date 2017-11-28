(function() {
    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator')
    .controller('horizon.dashboard.project.heat_dashboard.template_generator.TempModalController', ['$scope',
        '$mdDialog', 'hotgenNotify', 'hotgenUtils', 'hotgenStates', 'hotgenGlobals',
        'horizon.dashboard.project.heat_dashboard.template_generator.basePath',
        'horizon.dashboard.project.heat_dashboard.template_generator.projectPath',
        function($scope, $mdDialog, hotgenNotify, hotgenUtils, hotgenStates, hotgenGlobals, basePath, projectPath){
            $scope.basePath = basePath;
            $scope.projectPath = projectPath;
            $scope.dialogController = function ($scope, $mdDialog, hotgenStates, hotgenGlobals, hotgenNotify) {
                $scope.all_saved = false;
                $scope.cancel = function() {
                  $mdDialog.cancel();
                };
                $scope.download = function() {
                  // TODO: jump to stack creation page, or send to heat api.
                  // Temporarily Download
                  var today = new Date();
                  var filename = "template-"+today.toISOString();
                  var blob = new Blob([$scope.template_contents], {type: "text/plain;charset=utf-8"});
                  saveAs(blob, filename+".yaml.txt");

                  hotgenNotify.show_success('Template is downloaded.');
                };

                $scope.redirect = function(){
                  var redirect = window.location.origin + projectPath + 'stacks/';
                  window.location.href = redirect;
                };

                $scope.save = function() {
                  var files = hotgenGlobals.get_reference_files();
                  sessionStorage.setItem('files', JSON.stringify(files));
                  sessionStorage.setItem('generated', true);
                  sessionStorage.setItem('template', $scope.template_contents);
                  $scope.redirect();
//                  $mdDialog.cancel();
                };
                $scope.extract_properties = function(resource_data){
                    for (var property in resource_data){
                        var func = null;
                        switch (property){
                            case 'description':
                            case 'public_key':
                                func =  hotgenUtils.escape_characters;
                                break;
                            case 'metadata':
                            case 'scheduler_hints':
                            case 'value_specs':
                                func =  hotgenUtils.extract_keyvalue;
                                break;
                            case 'allocation_pools':
                            case 'allowed_address_pairs':
                            case 'block_device_mapping':
                            case 'block_device_mapping_v2':
                            case 'fixed_ips':
                            case 'host_routes':
                            case 'personality':
                            case 'rules':
                                func = hotgenUtils.extract_list_of_keyvalue;
                                break;
                            case 'dns_nameservers':
                            case 'dhcp_agent_ids':
                            case 'tags':
                                func = hotgenUtils.extract_list;
                                break;
                            case 'resource_def':
                                func = hotgenUtils.extract_resource_def;
                                break;
                            default:
                                break;
                        }
                        if ( func != null){
                            resource_data[property] = func(resource_data[property]);
                        }
                        hotgenUtils.strip_property(resource_data, property);

                    }
                    return resource_data;
                }
                $scope.warning = "Warning: Some resources remain unsaved."

                $scope.generate = function(){
                    // Generate `resources`  & `outputs` section
                    var resource_root = {};
                    var outputs_root = {};

                    if( hotgenStates.get_saved_flags_length() == 0 || hotgenStates.get_saved_resources_length() == 0){
                        $scope.all_saved = false;
                        $scope.warning = "Warning: Cannot generate, no resource has been saved.";
                        return '';
                    }
                    $scope.all_saved = hotgenStates.is_all_saved();
                    $scope.saved_resources = hotgenStates.get_saved_resources();
                    $scope.data = {
                        nodes: hotgenStates.get_nodes(),
                    }
                    var depends_ons = hotgenStates.get_saved_dependsons();

                    for (var idkey in $scope.saved_resources){

                        // Generate `resources` section
                        var resource_type = $scope.saved_resources[idkey].type;
                        var resource_name = hotgenStates.get_label_by_uuid(idkey);
                        var copy_data = angular.copy($scope.saved_resources[idkey].data)
                        var properties = $scope.extract_properties(copy_data);
                        resource_root[resource_name] = {
                            type: resource_type.replace(/_/g, ':'),
                        };
                        if (Object.keys(properties).length > 0){
                            resource_root[resource_name]["properties"] = properties;
                        }
                        if (idkey in depends_ons){
                            var depends_ids = angular.copy(depends_ons[idkey]);
                            if (depends_ons[idkey].length > 0){
                                resource_root[resource_name]['depends_on'] = [];
                                for (var idx in depends_ids){
                                    resource_root[resource_name]['depends_on'].push(hotgenStates.get_label_by_uuid(depends_ids[idx]));
                                }
                            }
                        }

                        // Generate `outputs` section
                        var output_detail = hotgenGlobals.get_resource_outputs(resource_type);
                        for (var idx in output_detail){
                            var output_key = resource_name + '_' + output_detail[idx].property;
                            outputs_root[output_key] = {
                                description: 'The ' + output_detail[idx].property + ' of ' + resource_name +'.',
                                value: '{ get_attr: ['+resource_name+', '+output_detail[idx].property+'] }',
                            };
                        }

                    }

                    var today = new Date();
                    var template_version = hotgenGlobals.get_template_version().split('.')[1]
                    var template_root = {
                        heat_template_version: template_version,
                        description: 'version 2017-09-01 created by HOT Generator at '+ today.toUTCString() + '.',
                        resources: resource_root,
                    }
                    if (Object.keys(outputs_root).length > 0){
                        template_root['outputs'] = outputs_root
                    }
                    var json_string = JSON.stringify(template_root);
                    return json2yaml(json_string);
                }

                $scope.template_contents = $scope.generate();

                $scope.template = {
                    title: 'Template',
                    content: $scope.template_contents,
                };
            }
            $scope.open = function(){
                if (hotgenGlobals.get_template_version() == null){
                    hotgenNotify.show_error('Please select template version at first.');
                    return;
                }
                $scope.dialogController.$inject = ['$scope', '$mdDialog', 'hotgenStates', 'hotgenGlobals', 'hotgenNotify'];

                $mdDialog.show({
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    templateUrl: basePath+'templates/modal_template.html',
                    controller: $scope.dialogController,
                }).then(function(){
//                    ;
                }, function(){
//                    ;
                });
            };

        }]);
})();
