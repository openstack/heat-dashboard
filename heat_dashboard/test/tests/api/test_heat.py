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

import io
from unittest import mock

from django.conf import settings
from django.test.utils import override_settings

from heat_dashboard import api
from heat_dashboard.test import helpers as test

from horizon import exceptions


class HeatApiTests(test.APITestCase):

    def test_stack_list(self):
        api_stacks = self.stacks.list()
        limit = getattr(settings, 'API_RESULT_LIMIT', 1000)

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks)
        stacks, has_more, has_prev = api.heat.stacks_list(self.request)
        heatclient.stacks.list.assert_called_once_with(limit=limit,
                                                       sort_dir='desc',
                                                       sort_key='created_at',
                                                       )
        self.assertCountEqual(stacks, api_stacks)
        self.assertFalse(has_more)
        self.assertFalse(has_prev)

    @override_settings(API_RESULT_PAGE_SIZE=2)
    def test_stack_list_sort_options(self):
        # Verify that sort_dir and sort_key work
        api_stacks = self.stacks.list()
        limit = getattr(settings, 'API_RESULT_LIMIT', 1000)
        sort_dir = 'asc'
        sort_key = 'size'

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks)

        stacks, has_more, has_prev = api.heat.stacks_list(self.request,
                                                          sort_dir=sort_dir,
                                                          sort_key=sort_key)
        self.assertCountEqual(stacks, api_stacks)
        self.assertFalse(has_more)
        self.assertFalse(has_prev)
        heatclient.stacks.list.assert_called_once_with(
            limit=limit, sort_dir=sort_dir, sort_key=sort_key,)

    @override_settings(API_RESULT_PAGE_SIZE=20)
    def test_stack_list_pagination_less_page_size(self):
        api_stacks = self.stacks.list()
        page_size = settings.API_RESULT_PAGE_SIZE
        sort_dir = 'desc'
        sort_key = 'created_at'

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks)

        stacks, has_more, has_prev = api.heat.stacks_list(self.request,
                                                          sort_dir=sort_dir,
                                                          sort_key=sort_key,
                                                          paginate=True)
        expected_stacks = api_stacks[:page_size]
        self.assertCountEqual(stacks, expected_stacks)
        self.assertFalse(has_more)
        self.assertFalse(has_prev)
        heatclient.stacks.list.assert_called_once_with(
            limit=page_size + 1,
            sort_dir=sort_dir,
            sort_key=sort_key)

    @override_settings(API_RESULT_PAGE_SIZE=10)
    def test_stack_list_pagination_equal_page_size(self):
        api_stacks = self.stacks.list()
        page_size = settings.API_RESULT_PAGE_SIZE
        sort_dir = 'desc'
        sort_key = 'created_at'

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks)

        stacks, has_more, has_prev = api.heat.stacks_list(self.request,
                                                          sort_dir=sort_dir,
                                                          sort_key=sort_key,
                                                          paginate=True)
        expected_stacks = api_stacks[:page_size]
        self.assertCountEqual(stacks, expected_stacks)
        self.assertFalse(has_more)
        self.assertFalse(has_prev)
        heatclient.stacks.list.assert_called_once_with(
            limit=page_size + 1, sort_dir=sort_dir,
            sort_key=sort_key,)

    @override_settings(API_RESULT_PAGE_SIZE=2)
    def test_stack_list_pagination_marker(self):
        page_size = getattr(settings, 'API_RESULT_PAGE_SIZE', 20)
        sort_dir = 'desc'
        sort_key = 'created_at'
        marker = 'nonsense'

        api_stacks = self.stacks.list()

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks[:page_size + 1])

        stacks, has_more, has_prev = api.heat.stacks_list(self.request,
                                                          marker=marker,
                                                          paginate=True,
                                                          sort_dir=sort_dir,
                                                          sort_key=sort_key,)

        self.assertEqual(len(stacks), page_size)
        self.assertCountEqual(stacks, api_stacks[:page_size])
        self.assertTrue(has_more)
        self.assertTrue(has_prev)
        heatclient.stacks.list.assert_called_once_with(
            limit=page_size + 1, marker=marker,
            sort_dir=sort_dir, sort_key=sort_key,)

    @override_settings(API_RESULT_PAGE_SIZE=2)
    def test_stack_list_pagination_marker_prev(self):
        page_size = getattr(settings, 'API_RESULT_PAGE_SIZE', 20)
        sort_dir = 'asc'
        sort_key = 'created_at'
        marker = 'nonsense'

        api_stacks = self.stacks.list()

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.list.return_value = iter(api_stacks[:page_size + 1])

        stacks, has_more, has_prev = api.heat.stacks_list(self.request,
                                                          marker=marker,
                                                          paginate=True,
                                                          sort_dir=sort_dir,
                                                          sort_key=sort_key,)

        self.assertEqual(len(stacks), page_size)
        self.assertCountEqual(stacks, api_stacks[:page_size])
        self.assertTrue(has_more)
        self.assertTrue(has_prev)
        heatclient.stacks.list.assert_called_once_with(
            limit=page_size + 1, marker=marker,
            sort_dir=sort_dir, sort_key=sort_key,)

    def test_template_get(self):
        api_stacks = self.stacks.list()
        stack_id = api_stacks[0].id
        mock_data_template = self.stack_templates.list()[0]

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.template.return_value = mock_data_template

        template = api.heat.template_get(self.request, stack_id)
        self.assertEqual(mock_data_template.data, template.data)
        heatclient.stacks.template.assert_called_once_with(stack_id)

    def test_stack_create(self):
        api_stacks = self.stacks.list()
        stack = api_stacks[0]

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        form_data = {'timeout_mins': 600}
        password = 'secret'
        heatclient.stacks.create.return_value = stack

        returned_stack = api.heat.stack_create(self.request,
                                               password,
                                               **form_data)
        from heatclient.v1 import stacks
        self.assertIsInstance(returned_stack, stacks.Stack)
        heatclient.stack.create_assert_called_once_with(**form_data)

    def test_stack_update(self):
        api_stacks = self.stacks.list()
        stack = api_stacks[0]
        stack_id = stack.id

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        form_data = {'timeout_mins': 600}
        password = 'secret'
        heatclient.stacks.update.return_value = stack

        returned_stack = api.heat.stack_update(self.request,
                                               stack_id,
                                               password,
                                               **form_data)
        from heatclient.v1 import stacks
        self.assertIsInstance(returned_stack, stacks.Stack)
        heatclient.stacks.update.assert_called_once_with(
            stack_id, **form_data)

    def test_snapshot_create(self):
        stack_id = self.stacks.first().id
        snapshot_create = self.stack_snapshot_create.list()[0]

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.snapshot.return_value = snapshot_create

        returned_snapshot_create_info = api.heat.snapshot_create(self.request,
                                                                 stack_id)

        self.assertEqual(returned_snapshot_create_info, snapshot_create)
        heatclient.stacks.snapshot.assert_called_once_with(stack_id)

    def test_snapshot_list(self):
        stack_id = self.stacks.first().id
        snapshot_list = self.stack_snapshot.list()

        heatclient = self.stub_heatclient()
        heatclient.stacks = mock.Mock()
        heatclient.stacks.snapshot_list.return_value = snapshot_list

        returned_snapshots = api.heat.snapshot_list(self.request, stack_id)

        self.assertCountEqual(returned_snapshots, snapshot_list)
        heatclient.stacks.snapshot_list.assert_called_once_with(stack_id)

    def test_get_template_files_with_template_data(self):
        tmpl = '''
    # comment

    heat_template_version: 2013-05-23
    resources:
      server1:
        type: OS::Nova::Server
        properties:
          flavor: m1.medium
          image: cirros
    '''
        expected_files = {}
        files = api.heat.get_template_files(template_data=tmpl)[0]
        self.assertEqual(files, expected_files)

    @mock.patch('heatclient.common.utils.read_url_content')
    def test_get_template_files(self, mock_read_url_content):
        tmpl = '''
    # comment

    heat_template_version: 2013-05-23
    resources:
      server1:
        type: OS::Nova::Server
        properties:
            flavor: m1.medium
            image: cirros
            user_data_format: RAW
            user_data:
              get_file: http://test.example/example
    '''
        expected_files = {u'http://test.example/example': b'echo "test"'}
        url = 'http://test.example/example'
        data = b'echo "test"'
        mock_read_url_content.return_value = data

        files = api.heat.get_template_files(template_data=tmpl)[0]
        self.assertEqual(files, expected_files)
        mock_read_url_content.assert_called_once_with(url)

    @mock.patch('urllib.request.urlopen')
    @mock.patch('heatclient.common.utils.read_url_content')
    def test_get_template_files_with_template_url(self, mock_read_url_content,
                                                  mock_request):
        url = 'https://test.example/example.yaml'
        data = b'''
    # comment

    heat_template_version: 2013-05-23
    resources:
      server1:
        type: OS::Nova::Server
        properties:
            flavor: m1.medium
            image: cirros
            user_data_format: RAW
            user_data:
              get_file: http://test.example/example
    '''
        data2 = b'echo "test"'
        expected_files = {'http://test.example/example': b'echo "test"'}
        mock_request.return_value = io.BytesIO(data)
        mock_read_url_content.return_value = data2

        files = api.heat.get_template_files(template_url=url)[0]
        self.assertEqual(files, expected_files)
        mock_request.assert_called_once_with(url)
        mock_read_url_content.assert_called_once_with(
            'http://test.example/example')

    def test_get_template_files_invalid(self):
        tmpl = '''
    # comment

    heat_template_version: 2013-05-23
    resources:
      server1:
        type: OS::Nova::Server
        properties:
            flavor: m1.medium
            image: cirros
            user_data_format: RAW
            user_data:
              get_file: file:///example
    '''
        try:
            api.heat.get_template_files(template_data=tmpl)[0]
        except exceptions.GetFileError:
            self.assertRaises(exceptions.GetFileError)

    def test_template_version_list(self):
        api_template_versions = self.template_versions.list()

        heatclient = self.stub_heatclient()
        heatclient.template_versions = mock.Mock()
        heatclient.template_versions.list.return_value = api_template_versions

        template_versions = api.heat.template_version_list(self.request)

        self.assertCountEqual(template_versions, api_template_versions)
        heatclient.template_versions.list.assert_called_once_with()

    def test_template_function_list(self):
        template_version = self.template_versions.first().version
        api_template_functions = self.template_functions.list()

        heatclient = self.stub_heatclient()
        heatclient.template_versions = mock.Mock()
        heatclient.template_versions.get.return_value = api_template_functions

        template_functions = api.heat.template_function_list(
            self.request, template_version)

        self.assertCountEqual(template_functions, api_template_functions)
        heatclient.template_versions.get.assert_called_once_with(
            template_version)
