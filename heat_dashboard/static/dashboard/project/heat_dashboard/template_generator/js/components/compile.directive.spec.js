(function() {
    'use strict';

    describe('hotgen-utils compile directive', function(){
        beforeEach(module('hotgen-utils'));

        var $compile, $rootScope, $scope, $isolateScope, element;

        beforeEach(inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();

            // element will enable you to test your directive's element on the DOM
            element = $compile(angular.element('<div compile="<h1>Compile Me</h1>"></div>'))($scope);

            // Digest needs to be called to set any values on the directive's scope
            $scope.$digest();

            // If the directive uses isolate scope, we need to get a reference to it
            // explicitly
        }));


        it('Replaces the element with the appropriate content',  function() {
            expect(element.html()).toContain("Compile Me");
        });

    });

})();
