(function() {

    'use strict';

    angular.module('hotgen-utils')
        .service('hotgenGlobals', function () {
            var globals = {
                resource_icons: {},
                edge_directions: {},
                necessary_properties: {},
                resource_components: {},
                node_labels: {},
                node_admin: {},
                resource_options: {'auth': {'admin': false}},
                template_version: null,
                resource_outputs: {},
                reference_files: {},
            };

            return {
                get_element: function(ele){
                    return globals[ele];
                },
                get_node_labels: function () {
                    return this.get_element('node_labels');
                },
                get_node_admin: function () {
                    return this.get_element('node_admin');
                },
                get_resource_icons: function () {
                    return this.get_element('resource_icons');
                },
                get_resource_components: function () {
                    return this.get_element('resource_components');
                },
                get_edge_directions: function () {
                    return this.get_element('edge_directions');
                },
                get_necessary_properties: function () {
                    return this.get_element('necessary_properties');
                },
                update_node_labels: function(key, value) {
                    globals.node_labels[key] = value;
                },
                update_node_admin: function(key, value) {
                    globals.node_admin[key] = value;
                },
                update_resource_icons: function(key, value) {
                    globals.resource_icons[key] = value;
                },
                update_resource_components: function(key, value) {
                    globals.resource_components[key] = value;
                },
                update_edge_directions: function(key, value) {
                    globals.edge_directions[key] = value;
                },
                update_necessary_properties: function(key, value) {
                    globals.necessary_properties[key] = value;
                },
                get_resource_options: function(){
                    return this.get_element('resource_options');
                },
                update_resource_options: function(u_object){
                    angular.extend(globals.resource_options, u_object)
                },
                set_template_version: function(value){
                    globals.template_version = value;
                },
                get_template_version: function(){
                    return globals.template_version;
                },
                set_resource_outputs: function(key, value){
                    globals.resource_outputs[key] = value
                },
                get_resource_outputs: function(key){
                    return globals.resource_outputs[key];
                },
                get_resource_types: function(){
                    return Object.keys(globals.resource_icons);
                },
                set_reference_file: function(key, value){
                    globals.reference_files[key] = value;
                },
                get_reference_file: function(key){
                    return globals.reference_files[key];
                },
                get_reference_files: function(key){
                    return globals.reference_files;
                },

            };
        });
})();