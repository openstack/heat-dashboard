
(function() {
  'use strict';

  angular
    .module('horizon.dashboard.project.heat_dashboard.stacks')
    .factory('horizon.dashboard.project.heat_dashboard.stacks.actions.check-stack.service', checkStackService);

  checkStackService.$inject = [
    '$q',
    'horizon.dashboard.project.heat_dashboard.service-api.heat',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal.deleteModalService',
    'horizon.framework.widgets.toast.service',
    'horizon.dashboard.project.heat_dashboard.stacks.resourceType'
  ];

  /*
   * @ngdoc factory
   * @name horizon.dashboard.project.heat_dashboard.stacks.actions.check-stack.service
   *
   * @Description
   * Brings up the check stacks confirmation modal dialog.

   * On submit, check given stacks.
   * On cancel, do nothing.
   */
  function checkStackService(
    $q,
    heat,
    policy,
    actionResultService,
    gettext,
    $qExtensions,
    deleteModal,
    toast,
    stacksResourceType
  ) {
    var notAllowedMessage = gettext("You are not allowed to check stacks: %s");

    var service = {
      allowed: allowed,
      perform: perform
    };

    return service;

    //////////////

    function perform(items, newScope) {
      var scope = newScope;
      var context = { };
      var stacks = angular.isArray(items) ? items : [items];
      context.labels = labelize(stacks.length);
      context.deleteEntity = checkStack;
      return $qExtensions.allSettled(stacks.map(checkPermission)).then(afterCheck);

      function checkPermission(stack) {
        return {promise: allowed(stack), context: stack};
      }

      function afterCheck(result) {
        var outcome = $q.reject();  // Reject the promise by default
        if (result.fail.length > 0) {
          toast.add('error', getMessage(notAllowedMessage, result.fail));
          outcome = $q.reject(result.fail);
        }
        if (result.pass.length > 0) {
          outcome = deleteModal.open(scope, result.pass.map(getEntity), context).then(createResult);
        }
        return outcome;
      }
    }

    function allowed(stack) {
      // only row actions pass in stack
      // otherwise, assume it is a batch action
      if (stack) {
        return $q.all([
          policy.ifAllowed({ rules: [['stack', 'check_stack']] }),
          notDeleted(stack)
        ]);
      } else {
        return policy.ifAllowed({ rules: [['stack', 'check_stack']] });
      }
    }

    function createResult(deleteModalResult) {
      // To make the result of this action generically useful, reformat the return
      // from the deleteModal into a standard form
      var actionResult = actionResultService.getActionResult();
      deleteModalResult.pass.forEach(function markDeleted(item) {
        actionResult.deleted(stacksResourceType, getEntity(item).stack_name);
      });
      deleteModalResult.fail.forEach(function markFailed(item) {
        actionResult.failed(stacksResourceType, getEntity(item).stack_name);
      });
      return actionResult.result;
    }

    function labelize(count) {
      return {

        title: ngettext(
          'Confirm Check Stack',
          'Confirm Check Stacks', count),

        message: ngettext(
          'You have selected "%s".',
          'You have selected "%s".', count),

        submit: ngettext(
          'Check Stack',
          'Check Stacks', count),

        success: ngettext(
          'Checked Stack: %s.',
          'Checked Stacks: %s.', count),

        error: ngettext(
          'Unable to check Stack: %s.',
          'Unable to check Stacks: %s.', count)
      };
    }

    function notDeleted(stack) {
      return $qExtensions.booleanAsPromise(stack.stack_status !== 'deleted');
    }


    function checkStack(stack) {
      return heat.checkStack(stack, true);
    }

    function getMessage(message, entities) {
      return interpolate(message, [entities.map(getName).join(", ")]);
    }

    function getName(result) {
      return getEntity(result).name;
    }

    function getEntity(result) {
      return result.context;
    }
  }
})();
