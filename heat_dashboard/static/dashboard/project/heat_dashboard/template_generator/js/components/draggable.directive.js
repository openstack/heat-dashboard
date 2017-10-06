(function(){

    'use strict';

    angular.module('horizon.dashboard.project.heat_dashboard.template_generator').directive('draggable', [function(){
        return function ($scope, element){
            var el = element[0];
            el.draggable = true;
            el.addEventListener('dragstart', function(e){
                this.style.opacity = '0.4';
                e.dataTransfer.setData('text', e.target.id);
            }, false);

            el.addEventListener('dragend', function(e){
                this.style.opacity = '1.0';
            }, false);

        }
    }]);

})();