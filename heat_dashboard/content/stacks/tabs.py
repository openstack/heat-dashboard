# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import logging
from operator import attrgetter

from django.utils.translation import ugettext_lazy as _

from horizon import messages
from horizon import tabs

from heat_dashboard import api
from heat_dashboard.content.stacks import api as project_api
from heat_dashboard.content.stacks import mappings
from heat_dashboard.content.stacks import tables as project_tables

from openstack_dashboard import policy


LOG = logging.getLogger(__name__)


class StackTopologyTab(tabs.Tab):
    name = _("Topology")
    slug = "topology"
    template_name = "project/stacks/_detail_topology.html"
    # template_name = "stacks/_detail_topology.html"
    preload = False

    def allowed(self, request):
        return policy.check(
            (("orchestration", "stacks:template"),
             ("orchestration", "stacks:lookup"),
             ("orchestration", "stacks:show"),
             ("orchestration", "resource:index"),),
            request)

    def get_context_data(self, request):
        context = {}
        stack = self.tab_group.kwargs['stack']
        context['stack_id'] = stack.id
        context['d3_data'] = project_api.d3_data(request, stack_id=stack.id)
        return context


class StackOverviewTab(tabs.Tab):
    name = _("Overview")
    slug = "overview"
    template_name = "project/stacks/_detail_overview.html"

    def allowed(self, request):
        return policy.check(
            (("orchestration", "stacks:template"),
             ("orchestration", "stacks:lookup"),
             ("orchestration", "stacks:show"),),
            request)

    def get_context_data(self, request):
        return {"stack": self.tab_group.kwargs['stack']}


class ResourceOverviewTab(tabs.Tab):
    name = _("Overview")
    slug = "resource_overview"
    template_name = "project/stacks/_resource_overview.html"

    def get_context_data(self, request):
        resource = self.tab_group.kwargs['resource']
        resource_url = mappings.resource_to_url(resource)
        return {
            "resource": resource,
            "resource_url": resource_url,
            "metadata": self.tab_group.kwargs['metadata']}


class StackEventsTab(tabs.TableTab):
    name = _("Events")
    slug = "events"
    table_classes = (project_tables.EventsTable, )
    template_name = "project/stacks/_detail_events.html"
    preload = False

    def allowed(self, request):
        return policy.check(
            (("orchestration", "stacks:template"),
             ("orchestration", "stacks:lookup"),
             ("orchestration", "stacks:show"),
             ("orchestration", "events:index"),),
            request)

    def get_events_data(self):
        stack = self.tab_group.kwargs['stack']
        stack_identifier = '%s/%s' % (stack.stack_name, stack.id)
        prev_marker = self.request.GET.get(
            project_tables.EventsTable._meta.prev_pagination_param)
        if prev_marker is not None:
            sort_dir = 'asc'
            marker = prev_marker
        else:
            sort_dir = 'desc'
            marker = self.request.GET.get(
                project_tables.EventsTable._meta.pagination_param, None)

        try:
            events, self._more, self._prev = api.heat.events_list(
                self.request,
                stack_identifier,
                marker=marker,
                paginate=True,
                sort_dir=sort_dir)
            if prev_marker is not None:
                events = sorted(events, key=attrgetter('event_time'),
                                reverse=True)
            LOG.debug('got events %s', events)
            # The stack id is needed to generate the resource URL.
            for event in events:
                event.stack_id = stack.id
        except Exception:
            events = []
            self._prev = False
            self._more = False
            messages.error(self.request, _(
                'Unable to get events for stack "%s".') % stack.stack_name)
        return events

    def has_prev_data(self, table):
        return self._prev

    def has_more_data(self, table):
        return self._more


class StackResourcesTab(tabs.Tab):
    name = _("Resources")
    slug = "resources"
    template_name = "project/stacks/_detail_resources.html"
    preload = False

    def allowed(self, request):
        return policy.check(
            (("orchestration", "stacks:template"),
             ("orchestration", "stacks:lookup"),
             ("orchestration", "stacks:show"),
             ("orchestration", "resource:index"),),
            request)

    def get_context_data(self, request):
        stack = self.tab_group.kwargs['stack']
        try:
            stack_identifier = '%s/%s' % (stack.stack_name, stack.id)
            resources = api.heat.resources_list(self.request, stack_identifier)
            LOG.debug('got resources %s', resources)
            # The stack id is needed to generate the resource URL.
            for r in resources:
                r.stack_id = stack.id
        except Exception:
            resources = []
            messages.error(request, _(
                'Unable to get resources for stack "%s".') % stack.stack_name)
        return {"stack": stack,
                "table": project_tables.ResourcesTable(
                    request, data=resources, stack=stack), }


class StackTemplateTab(tabs.Tab):
    name = _("Template")
    slug = "stack_template"
    template_name = "project/stacks/_stack_template.html"

    def allowed(self, request):
        return policy.check(
            (("orchestration", "stacks:template"),
             ("orchestration", "stacks:lookup"),
             ("orchestration", "stacks:show"),),
            request)

    def get_context_data(self, request):
        return {"stack_template": self.tab_group.kwargs['stack_template']}


class StackDetailTabs(tabs.TabGroup):
    slug = "stack_details"
    tabs = (StackTopologyTab, StackOverviewTab, StackResourcesTab,
            StackEventsTab, StackTemplateTab)
    sticky = True


class ResourceDetailTabs(tabs.TabGroup):
    slug = "resource_details"
    tabs = (ResourceOverviewTab,)
    sticky = True
