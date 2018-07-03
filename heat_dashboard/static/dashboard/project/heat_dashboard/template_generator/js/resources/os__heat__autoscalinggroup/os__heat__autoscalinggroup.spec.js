(function() {
    'use strict';

    describe('component os-heat-auto-scaling-group', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $scope, $isolateScope, $compile;
        var hotgenNotify;
        var element;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $compile = $injector.get('$compile');
            hotgenNotify = $injector.get('hotgenNotify');
            spyOn(hotgenNotify, 'show_success');
            spyOn(hotgenNotify, 'show_error');

            $scope.resource = {};
            $scope.dependson = [];
            $scope.connectedoptions = [];
            $scope.resourceForm = {};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-heat-autoscalinggroup autoscalinggroup="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-heat-autoscalinggroup>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();
        }));

        it('find tab title Properties',  function() {
            expect(element.find('span').html()).toContain("Properties");
            expect($isolateScope.is_upload).toEqual('false');
        });

        it('find tab title with resource set',  function() {
            $scope.resource = {resource: {type: 'filepath.yaml'}};

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<os-heat-autoscalinggroup autoscalinggroup="resource"'+
                    ' dependson="dependson" connectedoptions="connectedoptions"'+
                    ' form-reference="resourceForm"></os-heat-autoscalinggroup'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            $isolateScope = element.isolateScope();

            expect($isolateScope.is_upload ).toEqual('true');
        });

        it('$scope.is_upload should be successfully watched',  function() {
            $isolateScope.is_upload = 'true';
            $isolateScope.$digest();

            $isolateScope.is_upload = 'false';
            $isolateScope.$digest();
            $isolateScope.filecontent = 'some thing here';

            $isolateScope.is_upload = 'true';
            $isolateScope.$digest();

            expect($isolateScope.controller.autoscalinggroup.resource.type ).toEqual('');
        });

        it('file should be successfully uploaded',  function() {
            var blob = new Blob([''], {type: '', });
            blob['name'] = 'filename.yaml'
            var upload_element = {files: [blob], }
            spyOn(window, 'FileReader').and.returnValue({
              readAsText: function(file) {
                this.onload({});
              },
              result: 'file contents.'
            });
            $isolateScope.file_upload(upload_element);

            expect($isolateScope.filecontent).toEqual('file contents.');
            expect(hotgenNotify.show_success).toHaveBeenCalled();
        });

        it('file should be not uploaded return undefined',  function() {
            var upload_element = {files: []}
            var returnValue = $isolateScope.file_upload(upload_element);

            expect(returnValue).toEqual(undefined);

        });

        it('file should be not uploaded show error',  function() {
            var upload_element = {files: [{name: 'file.txt'}]}
            var returnValue = $isolateScope.file_upload(upload_element);

            expect(hotgenNotify.show_error).toHaveBeenCalled();

        });

        it('property should be successfully added',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.add_property();

            expect($ctrl.autoscalinggroup.resource.properties.length).toEqual(2);
        });

        it('property should be successfully deleted',  function() {
            var $ctrl = $isolateScope.$ctrl;
            $ctrl.delete_property();

            expect($ctrl.autoscalinggroup.resource.properties.length).toEqual(0);
        });

        it('click upload',  function() {
            spyOn(window, 'setTimeout').and.callFake(function(){});

            $isolateScope.clickUpload();

            expect(setTimeout).toHaveBeenCalled();
        });

    });

})();
