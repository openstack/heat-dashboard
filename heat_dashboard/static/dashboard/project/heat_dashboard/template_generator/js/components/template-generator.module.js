(function() {
    'use strict';

    angular
        .module('horizon.dashboard.project.heat_dashboard.template_generator',
            ['ngMaterial', 'ngMessages', 'ngSanitize',
             'hotgen-utils', 'hotgen-agent', 'ui.bootstrap',
            ])
        .config(['$mdThemingProvider', function($mdThemingProvider) {
          $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('blue')
            .warnPalette('red')
            ;
          }])
        .config(['$provide', '$windowProvider', function($provide, $windowProvider){
                var project_window = $windowProvider.$get();
                var staticPath = project_window.STATIC_URL + 'dashboard/project/heat_dashboard/template_generator/';
                var projectPath = project_window.WEBROOT+'project/';
                $provide.constant('horizon.dashboard.project.heat_dashboard.template_generator.basePath', staticPath);
                $provide.constant('horizon.dashboard.project.heat_dashboard.template_generator.projectPath', projectPath);

            }])
        .constant('horizon.dashboard.project.heat_dashboard.template_generator.validationRules', {
            'name': /^[A-Za-z0-9_.-]+$/,
            'path': /^\/[a-z0-9/-]+$/,
            'integer': /^\d*$/,
            'keypair': /^([A-Za-z0-9_.-]{1,255})=([A-Za-z0-9_.-]{1,255})$/,
            'ip_address': /^([0-9.]{1,15})|([A-Fa-f0-9:]{1,39})$/,
            'domain': /^[A-Za-z0-9_.-]+$/,
            'uuid4': /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/,
            'uuid_nohyphen': /^[a-f0-9]{32}$/,
            'mac_address': /^([A-Fa-f0-9]{2}[:-]){5}([A-Fa-f0-9]{2})$/,
            'cidr': /^(([0-9.]{1,15})(\/([0-9]|[1-2][0-9]|3[0-2]))?)|(([A-Fa-f0-9:]{1,39})(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?)$/,
            'zone': /^[a-zA-Z0-9_.-]{1,127}\.$/,
        })
        ;


})();

