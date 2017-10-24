(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator droppable directive', function(){
        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var hotgenGlobals;

        beforeEach(inject(function($injector){
            hotgenGlobals = $injector.get('hotgenGlobals');
        }));

        var $compile, $rootScope, $scope, $isolateScope, element;

        beforeEach(inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();

            // element will enable you to test your directive's element on the DOM
            element = $compile('<div droppable >drop me</div>')($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            // If the directive uses isolate scope, we need to get a reference to it
            // explicitly
            $isolateScope = element.isolateScope();
        }));


        it('Replaces the element with the appropriate content',  function() {
            expect(element.html()).toEqual('drop me');
        });

        it('Dragover event with preventDefault',  function() {
            var mockEvent= {
                type: 'dragover',
                preventDefault: function(){},
            }
            spyOn(mockEvent, 'preventDefault');
            $scope.dragoverHandler(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('Dragover event with !preventDefault',  function() {
            var mockEvent= {
                type: 'dragover',
            }
            $scope.dragoverHandler(mockEvent);
        });

        it('Drop event',  function() {
            var resource_type = 'OS::Project::ResourceType';
            hotgenGlobals.update_resource_icons(resource_type, {
                'code': '', 'color': '#000'
            })
            var mockEvent = {
                type: 'drop',
                dataTransfer: {
                    getData: function(key){return resource_type},
                },
                target: {id: 'icon-1'},
                preventDefault: function(){},
            };
            $scope.dropHandler(mockEvent);
        });

    });

})();
