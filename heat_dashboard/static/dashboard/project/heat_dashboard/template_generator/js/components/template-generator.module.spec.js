(function () {
  'use strict';

  describe('horizon.dashboard.project.heat_dashboard.template_generator module', function () {
    it('should be defined', function () {
      expect(angular.module('horizon.dashboard.project.heat_dashboard.template_generator')).toBeDefined();
    });
  });

  describe('horizon.dashboard.project.heat_dashboard.template_generator.basePath', function () {

    beforeEach(module('horizon.dashboard.project.heat_dashboard.template_generator'));

    it('should be defined and set correctly', inject([
      'horizon.dashboard.project.heat_dashboard.template_generator.basePath', '$window',
      function (basePath, $window) {
        expect(basePath).toBeDefined();
        expect(basePath).toBe($window.STATIC_URL + 'dashboard/project/heat_dashboard/template_generator/');
      }])
    );
  });

})();
