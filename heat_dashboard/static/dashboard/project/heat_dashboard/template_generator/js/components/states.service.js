(function() {
    'use strict';

    angular.module('hotgen-utils')
    .service('hotgenStates', ['VisDataSet', function(VisDataSet){
            // Caches for resources states.

            // { <node-id>: true/false ...}
            var saved_flags = {};

            var incremented_labels = {};

            // { id: <node-id> or <edge-id> }
            var selected = {};

            // { <node-id>: {<property_1>: <value> , ... } ...}
            var saved_resources = {};

            // { <node-id>: [<node-id> ...] ...}
            var saved_dependsons = {};

            // Caches of canvas nodes and edges.
            var network = null;
            var nodes = new VisDataSet();
            var edges = new VisDataSet();
            var counter = {};

            var increment_counter = function(type){
                if (! (type in counter)){
                    counter[type] = 0;
                }
                counter[type] += 1;
                return counter[type];
            }
            var get_counter = function(type){
                return counter[type];
            }
            var get_network = function(){
                return network;
            }
            var set_network = function(visNetwork){
                network = visNetwork
            }
            var get_nodes = function(){
                return nodes;
            }
            var get_edges = function(){
                return edges;
            }
            var get_selected = function(){
                return selected;
            }
            var set_selected = function(to_set){
                selected = to_set;
            }
            var update_saved_resources = function(key, data){
                saved_resources[key] = data;
            };
            var set_saved_resources = function(to_set){
                saved_resources = to_set;
            }
            var update_saved_dependsons = function(key, data){
                saved_dependsons[key] = data;
            };
            var set_saved_dependsons = function(to_set){
                saved_dependsons = to_set;
            }
            var is_all_saved = function(){
                return(Object.values(saved_flags).indexOf(false) == -1);
            };
            var get_saved_flags_length = function(){
                return Object.keys(saved_flags).length;
            }
            var get_saved_flags = function(){
                return saved_flags;
            }
            var set_saved_flags = function(to_set){
                saved_flags = to_set;
            }
            var get_saved_dependsons = function(){
                return saved_dependsons;
            }
            var update_saved_flags = function(key, value){
                saved_flags[key] = value;
            }
            var get_saved_resources = function(){
                return angular.copy(saved_resources);
            }
            var delete_saved_resources = function(key){
                delete saved_resources[key];
            }
            var get_saved_resources_length = function(){
                return Object.keys(saved_resources).length;
            };
            var clear_states = function(){
                saved_resources = {}
                saved_dependsons = {}
                selected = {}
                saved_flags = {}
                incremented_labels = {}
                counter = {}
            }
            var get_label_by_uuid = function(key){
                return incremented_labels[key];
            }
            var set_incremented_label = function(key, label){
                incremented_labels[key] = label
            }
            var get_incremented_labels = function(){
                return incremented_labels;
            }
            var set_incremented_labels = function(labels){
                incremented_labels = labels;
            }
            var get_counters = function(){
                return counter;
            }
            var set_counters = function(cached){
                counter = cached;
            }
            return {
                is_all_saved: is_all_saved,
                get_saved_resources: get_saved_resources,
                get_saved_resources_length: get_saved_resources_length,
                get_saved_dependsons: get_saved_dependsons,
                get_saved_flags: get_saved_flags,
                get_saved_flags_length: get_saved_flags_length,
                set_selected: set_selected,
                get_selected: get_selected,
                set_saved_resources: set_saved_resources,
                set_saved_dependsons: set_saved_dependsons,
                set_saved_flags: set_saved_flags,
                update_saved_flags: update_saved_flags,
                update_saved_resources: update_saved_resources,
                update_saved_dependsons:  update_saved_dependsons,
                delete_saved_resources: delete_saved_resources,
                clear_states: clear_states,
                get_nodes: get_nodes,
                get_edges: get_edges,
                get_network: get_network,
                set_network: set_network,
                increment_counter: increment_counter,
                get_counter: get_counter,
                get_label_by_uuid: get_label_by_uuid,
                set_incremented_label: set_incremented_label,
                get_incremented_labels: get_incremented_labels,
                set_incremented_labels: set_incremented_labels,
                get_counters: get_counters,
                set_counters: set_counters,
            }
        }])

})();
