(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator draggable directive', function(){
        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        var $compile, $rootScope, $scope, $isolateScope, element;

        beforeEach(inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<div draggable >drag me</div>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            // If the directive uses isolate scope, we need to get a reference to it
            // explicitly
            $isolateScope = element.isolateScope();
        }));


        it('Replaces the element with the appropriate content',  function() {
            expect(element[0].draggable).toEqual(true);
        });

        it('should change style when drag start',  function() {
            var mockEvent = {
                'type': 'dragstart',
                'dataTransfer': {
                    'setData': function(key, value){},
                },
                'target': {'id': 'icon-1'}
            };
            $scope.dragstartHandler(mockEvent, element);

            expect(element[0].style.opacity).toEqual('0.4')
        });

        it('should change style when drag end',  function() {
            var mockEvent = {
                'type': 'dragend',
            };
            $scope.dragendHandler(mockEvent, element);

            expect(element[0].style.opacity).toEqual('1')
        });

    });

})();
