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


class ResourceTypesTests(test.TestCase):

    use_mox = False

    @test.create_mocks({api.heat: ('resource_types_list',)})
    def test_index(self):
        self.mock_resource_types_list.return_value = \
                self.resource_types.list()

        res = self.client.get(
            reverse('horizon:project:resource_types:index'))
        self.assertTemplateUsed(
            res, 'horizon/common/_data_table_view.html')
        self.assertContains(res, 'AWS::CloudFormation::Stack')
        self.mock_resource_types_list.assert_called_once_with(
            IsHttpRequest(), filters={})

    @test.create_mocks({api.heat: ('resource_type_get',)})
    def test_detail_view(self):
        rt = self.api_resource_types.first()

        self.mock_resource_type_get.return_value = rt

        url = reverse('horizon:project:resource_types:details',
                      args=[rt['resource_type']])
        res = self.client.get(url)

        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertNoMessages()
        self.mock_resource_type_get.assert_called_once_with(
            IsHttpRequest(), rt['resource_type'])
