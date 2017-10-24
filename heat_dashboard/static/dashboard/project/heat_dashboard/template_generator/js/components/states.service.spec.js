(function() {
    'use strict';

    describe('hotgen-utils.hotgenStates', function(){
        beforeEach(module('hotgen-utils'));

        var hotgenStates;

        beforeEach(inject(function(_hotgenStates_){
            hotgenStates = _hotgenStates_;
        }));

        it('should exist', function(){
            expect(hotgenStates).toBeDefined();
        });

        it('check nodes and edges', function(){
            expect(hotgenStates.get_nodes().length).toEqual(0);

            expect(hotgenStates.get_edges().length).toEqual(0);
        });

        it('check network', function(){
            expect(hotgenStates.get_network()).toEqual(null);

            var networkMock = {};
            hotgenStates.set_network(networkMock);

            expect( hotgenStates.get_network().constructor).toEqual(Object);
        });

        it('check increment counter/labels', function(){
            expect(Object.keys(hotgenStates.get_incremented_labels()).length).toEqual(0);

            expect(Object.keys(hotgenStates.get_counters()).length).toEqual(0);

            expect(hotgenStates.increment_counter('type1')).toEqual(1);

            expect(hotgenStates.increment_counter('type1')).toEqual(2);

            expect(hotgenStates.get_counter('type1')).toEqual(2);

            hotgenStates.set_incremented_labels({});
            hotgenStates.set_incremented_label('type1', 'type1_2');

            expect(hotgenStates.get_label_by_uuid('type1')).toEqual('type1_2');

            hotgenStates.set_counters({});
        });

        it('check saved_flags', function(){
            expect(hotgenStates.get_saved_flags_length()).toEqual(0);
            expect(hotgenStates.is_all_saved()).toEqual(true);
            expect(Object.keys( hotgenStates.get_saved_flags()).length).toEqual(0);

            hotgenStates.set_saved_flags({'flag1': true});

            expect(hotgenStates.is_all_saved()).toEqual(true);
            expect(hotgenStates.get_saved_flags_length()).toEqual(1);
            expect(hotgenStates.get_saved_flags()['flag1']).toEqual(true);

            hotgenStates.update_saved_flags('flag1', false);

            expect(hotgenStates.is_all_saved()).toEqual(false);
            expect(hotgenStates.get_saved_flags()['flag1']).toEqual(false);
            expect(hotgenStates.get_saved_flags_length()).toEqual(1);

        });

        it('check dependsons', function(){
            expect(Object.keys(hotgenStates.get_saved_dependsons()).length).toEqual(0);

            hotgenStates.set_saved_dependsons({'type1': ['resource1', 'resource2']});

            expect( hotgenStates.get_saved_dependsons()['type1'].length).toEqual(2);

            hotgenStates.update_saved_dependsons('type2', ['resource3']);

            expect( hotgenStates.get_saved_dependsons()['type2'].length).toEqual(1);
        });

        it('check saved resources', function(){
            var returnValue = hotgenStates.get_saved_resources();

            expect(Object.keys(returnValue).length).toEqual(0);
            expect(hotgenStates.get_saved_resources_length()).toEqual(0);

            hotgenStates.set_saved_resources({'resource_name': {'properties':{}}});
            returnValue = hotgenStates.get_saved_resources();

            expect(Object.keys(returnValue).length).toEqual(1);
            expect(hotgenStates.get_saved_resources_length()).toEqual(1);

            hotgenStates.update_saved_resources('resource_name', {'properties':{}});
            hotgenStates.delete_saved_resources('resource_name');

            returnValue = hotgenStates.get_saved_resources();

            expect(Object.keys(returnValue).length).toEqual(0);
            expect(hotgenStates.get_saved_resources_length()).toEqual(0);

        });

        it('check selected', function(){
            var  returnValue = hotgenStates.get_selected();

            expect(Object.keys(returnValue).length).toEqual(0);

            hotgenStates.set_selected({'nodes': {}});

            expect(Object.keys(hotgenStates.get_selected()).length).toEqual(1);

        });

        it('check clear', function(){
            hotgenStates.clear_states();

        });

    });


})();
