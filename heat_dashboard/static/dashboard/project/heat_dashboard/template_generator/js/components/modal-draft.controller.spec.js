(function() {
    'use strict';

    describe('horizon.dashboard.project.heat_dashboard.template_generator.DraftModalController', function(){

        beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

        beforeEach(module('appTemplates'));

        beforeEach(module('hotgen-utils'));

        var hotgenStates;

        beforeEach(inject(function(_hotgenStates_){
            hotgenStates = _hotgenStates_;
        }));

        var $controller, controller, $scope, $rootScope, $mdDialog;

        beforeEach(inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            $mdDialog =  $injector.get('$mdDialog');
        }));


        beforeEach(inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            $scope =  $rootScope.$new();
            spyOn($scope, '$on');
            spyOn($mdDialog, 'show');
            controller = $controller('horizon.dashboard.project.heat_dashboard.template_generator.DraftModalController',
                { $scope: $scope, $mdDialog: $mdDialog});

            $mdDialog.show = jasmine.createSpy().and.callFake(function() {
                return {
                    then: (function (callBack) {
                                callBack(true); //return the value to be assigned.
                            }, function(callBack){
                                callBack(false)}
                          )
                    }
            });
        }));

        afterEach(function(){
            localStorage.clear();
            $mdDialog.cancel();
        })

        it('should exist', function(){
            expect(controller).toBeDefined();
        });

        it('$scope.$on should be called', function(){
            var event = $rootScope.$broadcast('handle_load_draft');

            expect($scope.$on).toHaveBeenCalled();

            $scope.handle_load_draft(event, {});
        });

        it('show dialog', function(){
            $scope.showDialog();
            $scope.$digest();

            expect($mdDialog.show).toHaveBeenCalled();
        });


        it('draftDialogController', function(){
            var draft = {}
            localStorage.setItem('draft_1', JSON.stringify(draft))
            $scope.draftDialogController($scope, $mdDialog, hotgenStates);

            expect($scope.data.nodes.length).toEqual(0);

        });

        it('draftDialogController load draft', function(){
            var draft = {'nodes': {'node-1':{}}, 'edges': {'edge-1':{}}};
            $scope.draftDialogController($scope, $mdDialog, hotgenStates);
            $scope.load(draft);

            expect($scope.data.nodes.length).toEqual(1);
            expect($scope.data.edges.length).toEqual(1);
        });

        it('draftDialogController cancel', function(){
            $scope.draftDialogController($scope, $mdDialog, hotgenStates);
            $scope.cancel();
        });
    });

})();
