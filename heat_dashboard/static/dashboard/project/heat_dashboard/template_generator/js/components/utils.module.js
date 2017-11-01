(function() {
    'use strict';

    angular.module('hotgen-utils', ['cgNotify', 'angular-uuid', 'ngVis'])
         .factory('hotgenUUID', ['uuid', function(uuid) {
            return {
              uuid: uuid.v4,
            };
         }])
         .factory('hotgenNotify', ['notify', '$rootScope', function(notify, $rootScope) {
            notify.config({
                position: 'right',
                duration: 0,
            });
            var show_success = function(message) {
                if ($rootScope.message_level < 2){
                    return -1;
                }
                notify({
                        message: message,
                        classes: ['alert-success',],
                        duration: 3000,
                });
                return 0;
            };

            var show_error = function(message) {
                if ($rootScope.message_level < 0){
                    return -1;
                }
                notify({
                        message: message,
                        classes: ['alert-danger',],
//                        duration: 5000,
                });
                return 0;
            };
            var show_info = function(message) {
                if ($rootScope.message_level < 3){
                    return -1;
                }
                notify({
                        message: message,
                        classes: ['alert-info',],
                        duration: 3000,
                });
                return 0;
            };

            var show_warning = function(message) {
                if ($rootScope.message_level < 1){
                    return -1;
                }
                notify({
                        message: message,
                        classes: ['alert-warning',],
                        duration: 5000,
                });
                return 0;
            };

            return {
                show_success: show_success,
                show_error: show_error,
                show_info: show_info,
                show_warning: show_warning
            };
         }])
         .factory('hotgenMessage', ['$rootScope', function($rootScope){
            var broadcast_edit_node = function(node_type){
                $rootScope.$broadcast('handle_edit_node', node_type);
            };
            var broadcast_edit_edge = function(from_type, to_type, from_id, to_id){
                $rootScope.$broadcast('handle_edit_edge',{
                        'from_type': from_type, 'to_type': to_type,
                        'from_id': from_id, 'to_id': to_id,
                });
            };
            var broadcast_load_draft = function(){
                $rootScope.$broadcast('handle_load_draft');
            };
            var broadcast_resources_loaded = function(){
                $rootScope.$broadcast('handle_resources_loaded');
            };
            var broadcast_update_template_version = function(){
                $rootScope.$broadcast('update_template_version');
            };
            return {
                broadcast_edit_node: broadcast_edit_node,
                broadcast_edit_edge: broadcast_edit_edge,
                broadcast_load_draft: broadcast_load_draft,
                broadcast_resources_loaded: broadcast_resources_loaded,
                broadcast_update_template_version: broadcast_update_template_version,
            }
        }])
        .factory('hotgenUtils', function(){
            var get_resource_string = function(identity){
                return '{ get_resource: '+identity+' }';
            }
            var filter_and_return_get_resource_element = function(array, property){
                var return_val = [];
                var idx = array.length-1;
                while (idx >= 0) {
                    if (typeof array[idx] == 'string'){
                        if (array[idx].indexOf('get_resource') != -1){
                            return_val = return_val.concat(array.splice(idx, 1))
                        }
                    } else if (typeof array[idx] == 'object' && property){
                        if (array[idx][property] && array[idx][property].indexOf('get_resource') != -1){
                            return_val = return_val.concat(array.splice(idx, 1))
                        }
                    }
                    idx = idx-1;
                }
                return return_val;
            }
            var escape_characters = function(value){
                return '"'+value.replace(/\\/g, '\\\\')
                                .replace(/"/g, '\\"')
                                .replace(/\n/g, "\\n")+'"';
            }
            var extract_keyvalue = function(value){
                var new_keyvalue = {}
                if (value instanceof Array ){
                    for (var idx in value){
                        if (value[idx] instanceof Object ){
                            if (Object.keys(value[idx]).length == 0){
                                continue;
                            }
                            new_keyvalue[value[idx].key] = value[idx].value
                        }
                    }
                }
                if (Object.keys(new_keyvalue).length == 0){
                    return null;
                }
                return new_keyvalue;

            }
            var extract_list_of_keyvalue = function(value_list){
                if (value_list instanceof Array ){
                    for (var idx=value_list.length-1; idx>=0; --idx){
                        if (Object.keys(value_list[idx]).length == 0){
                            value_list.splice(idx, 1)
                        }
                    }
                    if (value_list.length == 0){
                        return null;
                    }
                    return value_list
                }
                return null;
            }
            var extract_list = function(value_list){
                if (value_list instanceof Array){
                    if (value_list.length == 0){
                        return null;
                    }
                    return value_list
                }
                return null;
            }
            var extract_dicts = function check_dicts(value_dict){
                for (var key in value_dict){
                    if (! value_dict[key]){
                        delete value_dict[key];
                    }
                }
                return value_dict
            }
            var extract_dict = function extract_dict(value_dict){
                for (var key in value_dict){
                    strip_property(value_dict, key)
                }
            }
            var extract_array = function extract_array(value_list){
                for (var idx=value_list.length-1; idx>=0; --idx){
                    if (value_list[idx] == null || value_list[idx] == ''){
                        value_list.splice(idx, 1)
                    } else if (value_list[idx].constructor && value_list[idx].constructor == Object){
                        extract_dict(value_list[idx])
                        if (Object.keys(value_list[idx]).length == 0){
                            value_list.splice(idx, 1);
                        }
                    } else if (value_list[idx].constructor && value_list[idx].constructor == Array){
                        extract_array(value_list[idx])
                        if (value_list[idx].length == 0){
                            value_list.splice(idx, 1);
                        }
                    }
                }
            }
            var extract_resource_def = function extract_resource_def(value_dict){
                if (value_dict.properties){
                    value_dict.properties = extract_keyvalue(value_dict.properties)
                }
                if (value_dict.metadata){
                    value_dict.metadata = extract_keyvalue(value_dict.metadata)
                }
                return value_dict
            }
            var strip_property = function check_property(resource_data, property){

                if (resource_data[property] == null || resource_data[property] == ''){
                    delete resource_data[property];
                } else if (resource_data[property].constructor && resource_data[property].constructor == Object){
                    extract_dict(resource_data[property]);
                    if (Object.keys(resource_data[property]).length == 0){
                        delete resource_data[property];
                    }
                } else if (resource_data[property].constructor && resource_data[property].constructor == Array){
                    extract_array(resource_data[property]);
                    if (resource_data[property].length == 0){
                        delete resource_data[property];
                    }
                }
            }

            return {
                get_resource_string: get_resource_string,
                escape_characters: escape_characters,
                extract_keyvalue: extract_keyvalue,
                extract_list_of_keyvalue: extract_list_of_keyvalue,
                extract_list: extract_list,
                extract_dicts: extract_dicts,
                extract_resource_def: extract_resource_def,
                filter_and_return_get_resource_element: filter_and_return_get_resource_element,
                strip_property: strip_property,
            };
        })


})();
