# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.urls import reverse

from heat_dashboard import api
from heat_dashboard.test import helpers as test
from heat_dashboard.test.helpers import IsHttpRequest


class TemplateVersionsTests(test.TestCase):

    INDEX_URL = reverse('horizon:project:template_versions:index')

    @test.create_mocks({api.heat: ('template_version_list',)})
    def test_index(self):
        self.mock_template_version_list.return_value = \
            self.template_versions.list()

        res = self.client.get(self.INDEX_URL)
        self.mock_template_version_list.assert_called_once_with(
            IsHttpRequest())
        self.assertTemplateUsed(
            res, 'project/template_versions/index.html')
        self.assertContains(res, 'HeatTemplateFormatVersion.2012-12-12')

    @test.create_mocks({api.heat: ('template_version_list',)})
    def test_index_exception(self):
        self.mock_template_version_list.side_effect = \
            self.exceptions.heat

        res = self.client.get(self.INDEX_URL)
        self.mock_template_version_list.assert_called_once_with(
            IsHttpRequest())
        self.assertTemplateUsed(
            res, 'project/template_versions/index.html')
        self.assertEqual(len(res.context['table'].data), 0)
        self.assertMessageCount(res, error=1)

    @test.create_mocks({api.heat: ('template_function_list',)})
    def test_detail_view(self):
        t_version = self.template_versions.first().version
        t_functions = self.template_functions.list()

        self.mock_template_function_list.return_value = t_functions

        url = reverse('horizon:project:template_versions:details',
                      args=[t_version])
        res = self.client.get(url)

        self.mock_template_function_list.assert_called_once_with(
            IsHttpRequest(), t_version)
        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertNoMessages()

    @test.create_mocks({api.heat: ('template_function_list',)})
    def test_detail_view_with_exception(self):
        t_version = self.template_versions.first().version

        self.mock_template_function_list.side_effect = \
            self.exceptions.heat

        url = reverse('horizon:project:template_versions:details',
                      args=[t_version])
        res = self.client.get(url)

        self.mock_template_function_list.assert_called_once_with(
            IsHttpRequest(), t_version)
        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertEqual(len(res.context['table'].data), 0)
        self.assertMessageCount(res, error=1)
