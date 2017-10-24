(function() {
    'use strict';

    describe('hotgen-utils.hotgen-utils hotgenUUID', function(){
        beforeEach(module('hotgen-utils'));

        var hotgenUUID;

        beforeEach(inject(function(_hotgenUUID_){
            hotgenUUID = _hotgenUUID_;
        }));

        it('hotgenUUID should exist', function(){
            expect(hotgenUUID).toBeDefined();
        });

        it('uuid length > 0', function(){
            var returnValue = hotgenUUID.uuid();

            expect(returnValue.length).toBeGreaterThan(0);
        });
    });

    describe('hotgen-utils.hotgen-utils hotgenNotify', function(){
        beforeEach(module('hotgen-utils'));

        /* inject hotgenNotify */
        var hotgenNotify;

        beforeEach(inject(function(_hotgenNotify_){
            hotgenNotify = _hotgenNotify_;
        }));

        /* inject rootScope */
        var $rootScope;

        beforeEach(inject(function(_$rootScope_) {
            $rootScope = _$rootScope_;
        }));

        it('should exist', function(){
            expect(hotgenNotify).toBeDefined();
        });

        it('should show success', function(){
            $rootScope.message_level = 4;
            var returnValue = hotgenNotify.show_success('success notify unit test!');

            expect(returnValue).toEqual(0);
        });

        it('should not show success', function(){
            $rootScope.message_level = 0;
            var returnValue = hotgenNotify.show_success('success notify unit test!');

            expect(returnValue).toEqual(-1);
        });

        it('should show error', function(){
            $rootScope.message_level = 4;
            var returnValue = hotgenNotify.show_error('fail notify unit test!');

            expect(returnValue).toEqual(0);
        });

        it('should not show error', function(){
            $rootScope.message_level = -1;
            var returnValue = hotgenNotify.show_error('fail notify unit test!');

            expect(returnValue).toEqual(-1);
        });

        it('should show info', function(){
            $rootScope.message_level = 4;
            var returnValue = hotgenNotify.show_info('info notify unit test!');

            expect(returnValue).toEqual(0);
        });

        it('should not show info', function(){
            $rootScope.message_level = 0;
            var returnValue = hotgenNotify.show_info('info notify unit test!');

            expect(returnValue).toEqual(-1);
        });

        it('should show warning', function(){
            $rootScope.message_level = 4;
            var returnValue = hotgenNotify.show_warning('warning notify unit test!');

            expect(returnValue).toEqual(0);
        });

        it('should not show warning', function(){
            $rootScope.message_level = 0;
            var returnValue = hotgenNotify.show_warning('warning notify unit test!');

            expect(returnValue).toEqual(-1);
        });
    });

    describe('hotgen-utils.hotgen-utils hotgenMessage', function(){
        beforeEach(module('hotgen-utils'));

        var hotgenMessage;

        beforeEach(inject(function(_hotgenMessage_){
            hotgenMessage = _hotgenMessage_;
        }));

        /* inject rootScope */
        var $rootScope;

        beforeEach(inject(function(_$rootScope_) {
            $rootScope = _$rootScope_;
            spyOn($rootScope, '$broadcast');
        }));

        it('hotgenMessage should exist', function(){
            expect(hotgenMessage).toBeDefined();
        });

        it('should call event handle_edit_node', function(){
            hotgenMessage.broadcast_edit_node('note_type');

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_edit_node', 'note_type');
        });

        it('should call event handle_edit_edge', function(){
            hotgenMessage.broadcast_edit_edge('from_type', 'to_type', 'from_id', 'to_id');

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_edit_edge', {
                        'from_type': 'from_type', 'to_type': 'to_type',
                        'from_id': 'from_id', 'to_id': 'to_id',
                });
        });

        it('should call event handle_load_draft', function(){
            hotgenMessage.broadcast_load_draft('note_type');

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_load_draft');
        });

        it('should call event handle_resources_loaded', function(){
            hotgenMessage.broadcast_resources_loaded();

            expect($rootScope.$broadcast).toHaveBeenCalledWith('handle_resources_loaded');
        });

        it('should call event update_template_version', function(){
            hotgenMessage.broadcast_update_template_version();

            expect($rootScope.$broadcast).toHaveBeenCalledWith('update_template_version');
        });
    });


    describe('hotgen-utils.hotgen-utils hotgenUtils', function(){

        beforeEach(module('hotgen-utils'));

        var hotgenUtils;

        beforeEach(inject(function(_hotgenUtils_){
            hotgenUtils = _hotgenUtils_;
        }));

        it('hotgenUtils should exist', function(){
            expect(hotgenUtils).toBeDefined();
        });

        it('should return string contains get_resource', function(){
            var returnValue = hotgenUtils.get_resource_string('identity');

            expect(returnValue).toEqual('{ get_resource: identity }');
        });

        it('should filter elements', function(){
            var property = 'name';
            var array = ['ignore me', 1, '{ get_resource: find me }',
                    {'name': '{ get_resource: find me too }'},
                    {'no name': 'ignore me'}];
            var returnValue = hotgenUtils.filter_and_return_get_resource_element(array, property);

            expect(returnValue.length).toEqual(2);
        });

        it('should escape characters', function(){
            var returnValue = hotgenUtils.escape_characters('replace " and \\ and \n ');

            expect(returnValue).toEqual('"replace \\" and \\\\ and \\n "');
        });

        it('should extrace keyvalue', function(){
            var keyvalue = [{'key': 'key1', 'value': 'value1'},
                            {'key': 'key2', 'value': 'value2'}];
            var returnValue = hotgenUtils.extract_keyvalue(keyvalue);

            expect(returnValue['key1']).toEqual('value1');
            expect(returnValue['key2']).toEqual('value2');

            keyvalue = [{}, {}];
            returnValue = hotgenUtils.extract_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = '';
            returnValue = hotgenUtils.extract_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = [''];
            returnValue = hotgenUtils.extract_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);
        });

        it('should extract list of keyvalue', function(){
            var keyvalue = [];
            var returnValue = hotgenUtils.extract_list_of_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = 1;
            returnValue = hotgenUtils.extract_list_of_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = [{'destination': 'destination', 'nexthop': 'nexthop'}, {}];
            returnValue = hotgenUtils.extract_list_of_keyvalue(keyvalue);

            expect(returnValue.length).toEqual(1);

            keyvalue = [{}, {}];
            returnValue = hotgenUtils.extract_list_of_keyvalue(keyvalue);

            expect(returnValue).toEqual(null);

        });

        it('should extract list', function(){
            var keyvalue = [];
            var returnValue = hotgenUtils.extract_list(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = 1;
            returnValue = hotgenUtils.extract_list(keyvalue);

            expect(returnValue).toEqual(null);

            keyvalue = ['keep me', 'keep me too'];
            returnValue = hotgenUtils.extract_list(keyvalue);

            expect(returnValue.length).toEqual(2);

        });

        it('should extract dicts', function(){
            var keyvalue = {'discard me': '', 'discard me too': null};
            var returnValue = hotgenUtils.extract_dicts(keyvalue);

            expect(Object.keys(returnValue).length).toEqual(0);

            keyvalue = {'keep me': [], 'keep me too': 'me'};
            returnValue = hotgenUtils.extract_dicts(keyvalue);

            expect(Object.keys(returnValue).length).toEqual(2);

        });

        it('should strip_property', function(){
            var keyvalue = {'property': {'discard me': '', 'discard me too': null}};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(0);

            keyvalue = {'property': {'keep me': [], 'keep me too': 'me'}};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(1);

            keyvalue = {'property': {'keep me': [{}, []], 'keep me too': 'me'}};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(1);
            expect(Object.keys(keyvalue['property']).length).toEqual(1);

            keyvalue = {'property': [null, '', {}, [] ]};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(0);

            keyvalue = {'property': [1, 2, {'keep me': 3}, [4, 5, 6]]};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(1);
            expect(Object.keys(keyvalue['property']).length).toEqual(4);

            keyvalue = {'property': [ ['', ''], [[[]]] ]};
            hotgenUtils.strip_property(keyvalue, 'property');

            expect(Object.keys(keyvalue).length).toEqual(0);

        });

        it('should extract resource_def', function(){
            var keyvalue = {'properties': [{'key': 'k1', 'value': 'v1'}],
                            'metadata': [{'key': 'k2', 'value': 'v2'}],
                            'type': 'some file'};
            var returnValue = hotgenUtils.extract_resource_def(keyvalue);

            expect(returnValue.properties['k1']).toEqual('v1');
            expect(returnValue.metadata['k2']).toEqual('v2');

            var keyvalue = {'type': 'some file'};
            var returnValue = hotgenUtils.extract_resource_def(keyvalue);

            expect(returnValue.type).toEqual('some file');

        });
    });




})();
