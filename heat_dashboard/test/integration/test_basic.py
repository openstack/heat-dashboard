#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.


from openstack_dashboard.test.integration_tests import helpers


class TestHeatDashboardInstalled(helpers.TestCase):
    def test_alarms_page_opened(self):
        stacks_page = self.home_pg.go_to_project_orchestration_stackspage()
        self.assertEqual(stacks_page.page_title,
                         'Stacks - OpenStack Dashboard')

    def test_resource_types_page_opened(self):
        resource_types_page = (
            self.home_pg.go_to_project_orchestration_resourcetypespage())
        self.assertEqual(resource_types_page.page_title,
                         'Resource Types - OpenStack Dashboard')

    def test_template_versions_page_opened(self):
        template_versions_page = (
            self.home_pg.go_to_project_orchestration_templateversionspage())
        self.assertEqual(template_versions_page.page_title,
                         'Template Versions - OpenStack Dashboard')

    def test_template_generator_page_opened(self):
        template_generator_page = (
            self.home_pg.go_to_project_orchestration_templategeneratorpage())
        # TODO(e0ne): fix page title once Heat dashaboard will be updated
        self.assertEqual(template_generator_page.page_title,
                         'Horizon - OpenStack Dashboard')
