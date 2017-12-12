(function() {
    'use strict';

    angular.module('hotgen-agent', ['hotgen-utils', ])
         .factory('hotgenAgent', ['$http', '$location', 'hotgenNotify',
            function($http, $location, hotgenNotify) {
              var get_resource_options = function(){
                var static_url = $location.absUrl();
                  if (static_url.substr(-1) != '/'){
                    static_url += '/';
                  }
                return $http({
                      method: 'GET',
                      url: static_url+'get_resource_options'
                    }).then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        if (response.data.errors){
                            var msg = '';
                            angular.forEach(response.data.errors, function(value, key){
                               msg += key + ': '+ value + '. '
                            })

                            hotgenNotify.show_warning('Unable to retrieve resources '+msg+'.');
                        }
                        else{
                            hotgenNotify.show_success('Retrieve openstack resources successfully.');
                        }
                        return response.data;
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        hotgenNotify.show_error('Cannot get openstack resources.');
                        return null;
                    });
              }
              return {
                get_resource_options: get_resource_options,
              };
         }])

})();
