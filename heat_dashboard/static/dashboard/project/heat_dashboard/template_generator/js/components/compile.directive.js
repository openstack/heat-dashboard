(function() {
    'use strict';
    angular.module('hotgen-utils')
    .directive('compile', [ '$compile', function($compile){
            return {
                link: function(scope, element, attrs){
                      var content = $compile(attrs.compile)(scope);
                      element.append(content);
                }
            }
        }]);

})();
