(function(){

    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').directive('draggable', [function(){
        return function ($scope, element){
            var el = element[0];

            el.draggable = true;

            $scope.dragstartHandler = function(e){
                el.style.opacity = '0.4';
                e.dataTransfer.setData('text', e.target.id);
            }
            $scope.dragendHandler = function(e){
                    el.style.opacity = '1.0';
            }


            el.addEventListener('dragstart', $scope.dragstartHandler, false);

            el.addEventListener('dragend', $scope.dragendHandler, false);

        }
    }]);

})();