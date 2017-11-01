(function() {
    'use strict';

    describe('hotgen-utils.hotgenGlobals', function(){
        beforeEach(module('hotgen-utils'));

        var hotgenGlobals;

        beforeEach(inject(function(_hotgenGlobals_){
            hotgenGlobals = _hotgenGlobals_;
        }));

        it('should exist', function(){
            expect(hotgenGlobals).toBeDefined();
        });

        it('check get_element', function(){
            var returnValue = hotgenGlobals.get_element('resource_icons');

            expect(Object.keys(returnValue).length).toEqual(0);
        });

        it('check node_labels', function(){
            var returnValue = hotgenGlobals.get_node_labels();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_node_labels('key1', 'label1')

            expect(Object.keys(returnValue).length).toEqual(1);
        });

        it('check node_admin', function(){
            var returnValue = hotgenGlobals.get_node_admin();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_node_admin('key1', 'admin');

            expect(Object.keys(returnValue).length).toEqual(1);
        });

        it('check resource_icons', function(){
            var returnValue = hotgenGlobals.get_resource_icons();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_resource_icons('key1', 'admin');

            expect(Object.keys(returnValue).length).toEqual(1);
        });

        it('check get_resource_components', function(){
            var returnValue = hotgenGlobals.get_resource_components();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_resource_components('key1', 'component');

            expect(Object.keys(returnValue).length).toEqual(1);
        });

        it('check get_edge_directions', function(){
            var returnValue = hotgenGlobals.get_edge_directions();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_edge_directions('key1', 'edge');

            expect(Object.keys(returnValue).length).toEqual(1);
        });

        it('check get_template_version', function(){
            var returnValue = hotgenGlobals.get_template_version();

            expect(returnValue).toEqual(null);

            hotgenGlobals.set_template_version(['v1', 'v2']);

            expect(hotgenGlobals.get_template_version().length).toEqual(2);
        });

        it('check get_necessary_properties', function(){
            var returnValue = hotgenGlobals.get_necessary_properties();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenGlobals.update_necessary_properties('key1', ['p1', 'p2']);

            expect(hotgenGlobals.get_necessary_properties()['key1'].length).toEqual(2);
        });

        it('check get_resource_types', function(){
            var returnValue = hotgenGlobals.get_resource_types();

            expect(Object.keys(returnValue).length).toEqual(0);
        });

        it('check get_resource_options', function(){
            var returnValue = hotgenGlobals.get_resource_options();

            expect(Object.keys(returnValue).length).toEqual(1);

            hotgenGlobals.update_resource_options(['op1', 'op2']);

            expect(Object.keys(returnValue).length).toEqual(3);
        });

        it('check get_resource_outputs', function(){
            hotgenGlobals.set_resource_outputs('key1', '');
            var returnValue = hotgenGlobals.get_resource_outputs('key1');

            expect(returnValue).toEqual('');
        });

        it('check get_reference_file', function(){
            hotgenGlobals.set_reference_file('key1', '');
            var returnValue = hotgenGlobals.get_reference_file('key1');

            expect(returnValue).toEqual('');
        });

    });


})();
