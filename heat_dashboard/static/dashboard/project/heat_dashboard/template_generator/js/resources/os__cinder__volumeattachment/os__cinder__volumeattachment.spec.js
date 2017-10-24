(function() {
    'use strict';

    describe('os-cinder-volume-attachment', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var hotgenGlobals;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');
            hotgenGlobals = $injector.get('hotgenGlobals');

            hotgenGlobals.update_resource_options({
                    instances: [{id: 'instance1-id', name: 'instance1'}],
                    volumes: [{id: 'volume1-id', name: 'volume1-id'}],
                    });
            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-cinder-volume-attachment'+
                ' volumeattachment="resource" dependson="dependson"'+
                ' connectedoptions="connectedoptions" form-reference='
                +'"resourceForm"></os-cinder-volume-attachment>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {

            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with no connectedoptions set',  function() {
            element = $compile(angular.element('<os-cinder-volume-attachment'+
                ' volumeattachment="resource" dependson="dependson"'+
                ' form-reference='
                +'"resourceForm"></os-cinder-volume-attachment>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
        });

        it('find tab title with connectedoptions set',  function() {
            $scope.resource = {instance_uuid: 'instance-uuid', volume_id: 'volume-id'}
            $scope.connectedoptions = {instance_uuid: [{value: 'instance-uuid'}],
                                       volume_id: [{value: 'volume-id'}]};

            element = $compile(angular.element('<os-cinder-volume-attachment'+
                ' volumeattachment="resource" dependson="dependson"'+
                ' connectedoptions="connectedoptions" form-reference='
                +'"resourceForm"></os-cinder-volume-attachment>'))($scope);

            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect(element.find('span').html()).toContain("Properties");
            expect($isolateScope.$ctrl.volumeattachment.instance_uuid).toEqual('instance-uuid');
            expect($isolateScope.$ctrl.volumeattachment.volume_id).toEqual('volume-id');
        });
    });

})();
