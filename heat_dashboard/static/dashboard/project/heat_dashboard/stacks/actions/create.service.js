/**
 * (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.dashboard.project.heat_dashboard.stacks')
    .factory('horizon.dashboard.project.heat_dashboard.stacks.actions.create-stack.service', createStackService);

  createStackService.$inject = [
    '$q',
    'horizon.dashboard.project.heat_dashboard.service-api.heat',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.widgets.modal.wizard-modal.service',
    'horizon.dashboard.project.heat_dashboard.actions.createWorkflow',
    'horizon.framework.widgets.toast.service',
    'horizon.dashboard.project.heat_dashboard.stacks.resourceType'

  ];

  /**
   * @ngDoc factory
   * @name horizon.dashboard.project.heat_dashboard.stacks.actions.create-stack.service
   * @Description A service to open the user wizard.
   */
  function createStackService(
    $q,
    heat,
    policy,
    actionResultService,
    wizardModalService,
    createWorkflow,
    toast,
    resourceType,

  ) {
    var message = {
      success: gettext('Stack %s was successfully created.')
    };

    var scope;

    var service = {
      perform: perform,
      allowed: allowed
    };

    return service;

    //////////////

    function allowed() {
      return policy.ifAllowed({ rules: [['stack', 'add_stack']] });
    }

    function perform(selected, $scope) {
      scope = $scope;

      return wizardModalService.modal({
        workflow: createWorkflow,
        submit: submit
      }).result;
    }

    function submit(stepModels) {
      var finalModel = angular.extend(
        {},
        stepModels.selectTemplateForm,
        stepModels.stackForm);
      if (finalModel.source_type === 'url') {
        delete finalModel.data;
      } else {
        delete finalModel.template_url;
      }
      function onProgress(progress) {
        scope.$broadcast(events.STACK_CREATE_PROGRESS, progress);
      }
      return glance.createStack(finalModel, onProgress).then(onCreateStack);
    }

    function onCreateStack(response) {
      var newImage = response.data;
      toast.add('success', interpolate(message.success, [newStack.name]));
      return actionResultService.getActionResult()
        .created(resourceType, newStack.id)
        .result;
    }

  } // end of createService
})(); // end of IIFE
