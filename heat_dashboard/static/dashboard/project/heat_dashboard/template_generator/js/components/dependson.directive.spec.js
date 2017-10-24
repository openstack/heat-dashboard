(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator dependson directive', function(){
        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        var $compile, $rootScope, $scope, $isolateScope, element;

        beforeEach(inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();
            $scope.dependson = ['node-id-1111', 'node-id-2222', 'node-id-3333'];

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<depends-on dependson="dependson"></depends-on>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            // If the directive uses isolate scope, we need to get a reference to it
            // explicitly
            $isolateScope = element.isolateScope();
        }));


        it('Replaces the element with the appropriate content',  function() {
            expect(element.find('label').html()).toContain("Depends on");
        });

        it('toggle function modifies array',  function() {
            var array = [0, 1, 2, 3, 4];
            $isolateScope.toggle(5, array);

            expect(array.length).toEqual(6);

            $isolateScope.toggle(0, array);
            $isolateScope.toggle(5, array);

            expect(array.length).toEqual(4);
        });

        it('check array item existence ',  function() {
            var array = [0, 1, 2, 3, 4];

            expect($isolateScope.exists(5, array)).toEqual(false);
            expect($isolateScope.exists(1, array)).toEqual(true);
        });
    });

})();
