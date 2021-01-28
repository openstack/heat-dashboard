// Karma configuration
// Generated on Fri Oct 06 2017 11:56:14 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'node_modules/angular/angular.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-messages/angular-messages.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/angular-material/angular-material.js',
        'node_modules/@cgross/angular-notify/dist/angular-notify.js',
        'node_modules/angular-visjs/angular-vis.js',
        'node_modules/angular-uuid/angular-uuid.js',
        'node_modules/file-saver/FileSaver.js',
        'node_modules/vis/dist/vis.js',
        'node_modules/js-yaml/dist/js-yaml.js',
        'node_modules/@appscode/json2yaml/src/json2yaml.js',
        'node_modules/angular-ui-router/release/angular-ui-router.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/components/*.module.js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/components/!(*.spec|*.module).js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/components/*.spec.js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/resources/*/!(*.spec).js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/resources/*/*.spec.js',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/templates/*.html',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/resources/*/*.html',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/css/img/icons/*.svg',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/components/!(*.spec).js': 'coverage',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/resources/*/!(*.spec).js': 'coverage',
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/templates/*.html': ['ng-html2js'],
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/js/resources/*/*.html': ['ng-html2js'],
        'heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/css/img/icons/*.svg': ['ng-html2js'],
    },

    ngHtml2JsPreprocessor: {
//        stripPrefix: './heat_dashboard/static/',
//        prependPrefix: 'undefined',
        cacheIdFromPath: function(filepath) {
            var cacheId;
            if (filepath.indexOf('.svg') != -1){
                cacheId = filepath.replace('heat_dashboard/static/dashboard/project/heat_dashboard/template_generator/', '{$ basePath $}');
            } else if (filepath.indexOf('.html') != -1){
                cacheId = filepath.replace('heat_dashboard/static/', 'undefined');
            }
            console.log(filepath)
            return cacheId;
          },

        moduleName: 'appTemplates',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox', ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
