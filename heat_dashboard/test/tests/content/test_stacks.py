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

import json
import re
from unittest import mock

from django.conf import settings
from django.core import exceptions
from django.test.utils import override_settings
from django.urls import reverse
from django.utils import html

from heatclient.common import template_format as hc_format
from openstack_dashboard import api as dashboard_api

from heat_dashboard import api
from heat_dashboard.content.stacks import forms
from heat_dashboard.content.stacks import mappings
from heat_dashboard.content.stacks import tables
from heat_dashboard.test import helpers as test

INDEX_TEMPLATE = 'project/stacks/index.html'
INDEX_URL = reverse('horizon:project:stacks:index')
DETAIL_URL = 'horizon:project:stacks:detail'


class MockResource(object):
    def __init__(self, resource_type, physical_resource_id):
        self.resource_type = resource_type
        self.physical_resource_id = physical_resource_id


class MappingsTests(test.TestCase):

    def test_mappings(self):

        def assertMappingUrl(url, resource_type, physical_resource_id):
            mock = MockResource(resource_type, physical_resource_id)
            mock_url = mappings.resource_to_url(mock)
            self.assertEqual(url, mock_url)

        assertMappingUrl(
            '/project/networks/subnets/aaa/detail',
            'OS::Neutron::Subnet',
            'aaa')
        assertMappingUrl(
            None,
            'OS::Neutron::Subnet',
            None)
        assertMappingUrl(
            None,
            None,
            None)
        assertMappingUrl(
            None,
            'AWS::AutoScaling::LaunchConfiguration',
            'aaa')
        assertMappingUrl(
            '/project/instances/aaa/',
            'AWS::EC2::Instance',
            'aaa')
        assertMappingUrl(
            '/project/containers/container/aaa/',
            'OS::Swift::Container',
            'aaa')
        assertMappingUrl(
            None,
            'Foo::Bar::Baz',
            'aaa')
        assertMappingUrl(
            '/project/instances/aaa/',
            'OS::Nova::Server',
            'aaa')
        assertMappingUrl(
            '/project/stacks/stack/aaa/',
            'OS::Heat::ResourceGroup',
            'aaa')

    def test_stack_output(self):
        self.assertEqual(u'<pre>foo</pre>', mappings.stack_output('foo'))
        self.assertEqual(u'', mappings.stack_output(None))

        outputs = ['one', 'two', 'three']
        expected_text = """[\n  "one",\n  "two",\n  "three"\n]"""

        self.assertEqual(u'<pre>%s</pre>' % html.escape(expected_text),
                         mappings.stack_output(outputs))

        outputs = {'foo': 'bar'}
        expected_text = """{\n  "foo": "bar"\n}"""
        self.assertEqual(u'<pre>%s</pre>' % html.escape(expected_text),
                         mappings.stack_output(outputs))

        self.assertEqual(
            u'<a href="http://www.example.com/foo" target="_blank">'
            'http://www.example.com/foo</a>',
            mappings.stack_output('http://www.example.com/foo'))


class StackTests(test.TestCase):

    @override_settings(API_RESULT_PAGE_SIZE=2)
    @test.create_mocks({api.heat: ('stacks_list',)})
    def test_index_paginated(self):
        stacks = self.stacks.list()[:5]
        self.mock_stacks_list.side_effect = [
            [stacks, True, True],
            [stacks[:2], True, True],
            [stacks[2:4], True, True],
            [stacks[4:], True, True]
        ]

        url = reverse('horizon:project:stacks:index')
        res = self.client.get(url)
        # get all
        self.assertEqual(len(res.context['stacks_table'].data),
                         len(stacks))
        self.assertTemplateUsed(res, INDEX_TEMPLATE)

        res = self.client.get(url)
        # get first page with 2 items
        self.assertEqual(len(res.context['stacks_table'].data),
                         settings.API_RESULT_PAGE_SIZE)

        url = "%s?%s=%s" % (reverse('horizon:project:stacks:index'),
                            tables.StacksTable._meta.pagination_param,
                            stacks[2].id)
        res = self.client.get(url)
        # get second page (items 2-4)
        self.assertEqual(len(res.context['stacks_table'].data),
                         settings.API_RESULT_PAGE_SIZE)

        url = "%s?%s=%s" % (reverse('horizon:project:stacks:index'),
                            tables.StacksTable._meta.pagination_param,
                            stacks[4].id)
        res = self.client.get(url)
        # get third page (item 5)
        self.assertEqual(len(res.context['stacks_table'].data),
                         1)

    @override_settings(API_RESULT_PAGE_SIZE=2)
    @test.create_mocks({api.heat: ('stacks_list',)})
    def test_index_prev_paginated(self):
        stacks = self.stacks.list()[:3]
        filters = {}
        self.mock_stacks_list.side_effect = [
            [stacks, True, False],
            [stacks[:2], True, True],
            [stacks[2:], True, True],
            [stacks[:2], True, True]
        ]

        url = reverse('horizon:project:stacks:index')
        res = self.client.get(url)
        # get all
        self.assertEqual(len(res.context['stacks_table'].data),
                         len(stacks))
        self.assertTemplateUsed(res, INDEX_TEMPLATE)

        res = self.client.get(url)
        # get first page with 2 items
        self.assertEqual(len(res.context['stacks_table'].data),
                         settings.API_RESULT_PAGE_SIZE)

        url = "%s?%s=%s" % (reverse('horizon:project:stacks:index'),
                            tables.StacksTable._meta.pagination_param,
                            stacks[2].id)
        res = self.client.get(url)
        # get second page (item 3)
        self.assertEqual(len(res.context['stacks_table'].data), 1)

        url = "%s?%s=%s" % (reverse('horizon:project:stacks:index'),
                            tables.StacksTable._meta.prev_pagination_param,
                            stacks[2].id)
        res = self.client.get(url)
        # prev back to get first page with 2 pages
        self.assertEqual(len(res.context['stacks_table'].data),
                         settings.API_RESULT_PAGE_SIZE)
        self.mock_stacks_list.assert_has_calls([
            mock.call(test.IsHttpRequest(), marker=None,
                      paginate=True, sort_dir='desc', filters=filters),
            mock.call(test.IsHttpRequest(), marker=None,
                      paginate=True, sort_dir='desc', filters=filters),
            mock.call(test.IsHttpRequest(), marker=stacks[2].id,
                      paginate=True, sort_dir='desc', filters=filters)])

    @test.create_mocks({api.heat: ('stack_create', 'template_validate'),
                        dashboard_api.neutron: ('network_list_for_tenant', )})
    def test_launch_stack(self):
        template = self.stack_templates.first()
        stack = self.stacks.first()
        self.mock_template_validate.return_value = \
            json.loads(template.validate)
        self.mock_stack_create.reutrn_value = None
        self.mock_network_list_for_tenant.side_effect = \
            [self.networks.list(), self.networks.list()]

        url = reverse('horizon:project:stacks:select_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/select_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'referenced_files': {},
                     'method': forms.TemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/create.html')

        url = reverse('horizon:project:stacks:launch')
        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'password': 'password',
                     'parameters': template.validate,
                     'stack_name': stack.stack_name,
                     "timeout_mins": 60,
                     "disable_rollback": True,
                     "__param_DBUsername": "admin",
                     "__param_LinuxDistribution": "F17",
                     "__param_InstanceType": "m1.small",
                     "__param_KeyName": "test",
                     "__param_DBPassword": "admin",
                     "__param_DBRootPassword": "admin",
                     "__param_DBName": "wordpress",
                     "__param_Network": self.networks.list()[0]['id'],
                     'method': forms.CreateStackForm.__name__}
        res = self.client.post(url, form_data)
        self.assertRedirectsNoFollow(res, INDEX_URL)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template.data))
        self.mock_stack_create.assert_called_once_with(
            test.IsHttpRequest(), stack_name=stack.stack_name,
            timeout_mins=60, disable_rollback=True, template=None,
            parameters=test.IsA(dict), password='password', files=None)
        self.mock_network_list_for_tenant.assert_has_calls([
            mock.call(test.IsHttpRequest(), self.tenant.id),
            mock.call(test.IsHttpRequest(), self.tenant.id)])

    @test.create_mocks({api.heat: ('stack_create', 'template_validate'),
                        dashboard_api.neutron: ('network_list_for_tenant', )})
    def test_launch_stack_with_environment(self):
        template = self.stack_templates.first()
        environment = self.stack_environments.first()
        stack = self.stacks.first()

        self.mock_template_validate.return_value = \
            json.loads(template.validate)
        self.mock_stack_create.return_value = None
        self.mock_network_list_for_tenant.side_effect = \
            [self.networks.list(), self.networks.list()]

        url = reverse('horizon:project:stacks:select_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/select_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'environment_source': 'raw',
                     'environment_data': environment.data,
                     'method': forms.TemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/create.html')

        url = reverse('horizon:project:stacks:launch')
        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'environment_source': 'raw',
                     'environment_data': environment.data,
                     'password': 'password',
                     'parameters': template.validate,
                     'stack_name': stack.stack_name,
                     "timeout_mins": 60,
                     "disable_rollback": True,
                     "__param_DBUsername": "admin",
                     "__param_LinuxDistribution": "F17",
                     "__param_InstanceType": "m1.small",
                     "__param_KeyName": "test",
                     "__param_DBPassword": "admin",
                     "__param_DBRootPassword": "admin",
                     "__param_DBName": "wordpress",
                     "__param_Network": self.networks.list()[0]['id'],
                     'method': forms.CreateStackForm.__name__}
        res = self.client.post(url, form_data)
        self.assertRedirectsNoFollow(res, INDEX_URL)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template.data),
            environment=environment.data)
        self.mock_stack_create.assert_called_once_with(
            test.IsHttpRequest(), stack_name=stack.stack_name,
            timeout_mins=60, disable_rollback=True,
            template=None, environment=environment.data,
            parameters=test.IsA(dict), password='password',
            files=None)
        self.mock_network_list_for_tenant.assert_has_calls([
            mock.call(test.IsHttpRequest(), self.tenant.id),
            mock.call(test.IsHttpRequest(), self.tenant.id)])

    @test.create_mocks({api.heat: ('template_validate',)})
    def test_launch_stack_with_hidden_parameters(self):
        template = {
            'data': ('heat_template_version: 2013-05-23\n'
                     'parameters:\n'
                     '  public_string:\n'
                     '    type: string\n'
                     '  secret_string:\n'
                     '    type: string\n'
                     '    hidden: true\n'),
            'validate': {
                'Description': 'No description',
                'Parameters': {
                    'public_string': {
                        'Label': 'public_string',
                        'Description': '',
                        'Type': 'String',
                        'NoEcho': 'false'
                    },
                    'secret_string': {
                        'Label': 'secret_string',
                        'Description': '',
                        'Type': 'String',
                        'NoEcho': 'true'
                    }
                }
            }
        }
        self.mock_template_validate.return_value = template['validate']

        url = reverse('horizon:project:stacks:select_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/select_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template['data'],
                     'method': forms.TemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/create.html')

        # ensure the fields were rendered correctly
        pattern = ('<input class="form-control" '
                   'id="id___param_public_string" '
                   'name="__param_public_string" type="text" required/>')
        secret = ('<input class="form-control" '
                  'id="id___param_secret_string" '
                  'name="__param_secret_string" '
                  'type="password" required>')
        self.assertContains(res, pattern, html=True)
        self.assertContains(res, secret, html=True)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template['data']))

    @test.create_mocks({api.heat: ('template_validate',)})
    def test_launch_stack_with_parameter_group(self):
        template = {
            'data': ('heat_template_version: 2013-05-23\n'
                     'parameters:\n'
                     '  last_param:\n'
                     '    type: string\n'
                     '  first_param:\n'
                     '    type: string\n'
                     '  middle_param:\n'
                     '    type: string\n'
                     'parameter_groups:\n'
                     '- parameters:\n'
                     '  - first_param\n'
                     '  - middle_param\n'
                     '  - last_param\n'),
            'validate': {
                'Description': 'No description',
                'Parameters': {
                    'last_param': {
                        'Label': 'last_param',
                        'Description': '',
                        'Type': 'String',
                        'NoEcho': 'false'
                    },
                    'first_param': {
                        'Label': 'first_param',
                        'Description': '',
                        'Type': 'String',
                        'NoEcho': 'false'
                    },
                    'middle_param': {
                        'Label': 'middle_param',
                        'Description': '',
                        'Type': 'String',
                        'NoEcho': 'true'
                    }
                },
                'ParameterGroups': [
                    {
                        'parameters': [
                            'first_param',
                            'middle_param',
                            'last_param'
                        ]
                    }
                ]
            }
        }
        self.mock_template_validate.return_value = \
            template['validate']

        url = reverse('horizon:project:stacks:select_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/select_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template['data'],
                     'method': forms.TemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/create.html')

        # ensure the fields were rendered in the correct order
        regex = re.compile('^.*>first_param<.*>middle_param<.*>last_param<.*$',
                           flags=re.DOTALL)
        self.assertRegex(res.content.decode('utf-8'), regex)

    @test.create_mocks({api.heat: ('stack_create', 'template_validate')})
    def test_launch_stack_parameter_types(self):
        template = {
            'data': ('heat_template_version: 2013-05-23\n'
                     'parameters:\n'
                     '  param1:\n'
                     '    type: string\n'
                     '  param2:\n'
                     '    type: number\n'
                     '  param3:\n'
                     '    type: json\n'
                     '  param4:\n'
                     '    type: comma_delimited_list\n'
                     '  param5:\n'
                     '    type: boolean\n'),
            'validate': {
                "Description": "No description",
                "Parameters": {
                    "param1": {
                        "Type": "String",
                        "NoEcho": "false",
                        "Description": "",
                        "Label": "param1"
                    },
                    "param2": {
                        "Type": "Number",
                        "NoEcho": "false",
                        "Description": "",
                        "Label": "param2"
                    },
                    "param3": {
                        "Type": "Json",
                        "NoEcho": "false",
                        "Description": "",
                        "Label": "param3"
                    },
                    "param4": {
                        "Type": "CommaDelimitedList",
                        "NoEcho": "false",
                        "Description": "",
                        "Label": "param4"
                    },
                    "param5": {
                        "Type": "Boolean",
                        "NoEcho": "false",
                        "Description": "",
                        "Label": "param5"
                    }
                }
            }
        }
        stack = self.stacks.first()

        self.mock_template_validate.return_value = \
            template['validate']
        self.mock_stack_create.return_value = None

        url = reverse('horizon:project:stacks:select_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/select_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template['data'],
                     'method': forms.TemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/create.html')

        # ensure the fields were rendered correctly
        input_str = ('<input class="form-control" '
                     'id="id___param_param{0}" '
                     'name="__param_param{0}" type="{1}" required/>')
        self.assertContains(res, input_str.format(3, 'text'), html=True)
        self.assertContains(res, input_str.format(4, 'text'), html=True)

        input_str_param2 = ('<input type="number" name="__param_param2" '
                            'autocomplete="off" '
                            'required class="form-control" '
                            'id="id___param_param2" />')
        self.assertContains(res, input_str_param2, html=True)

        # post some sample data and make sure it validates
        url = reverse('horizon:project:stacks:launch')
        form_data = {'template_source': 'raw',
                     'template_data': template['data'],
                     'password': 'password',
                     'parameters': json.dumps(template['validate']),
                     'stack_name': stack.stack_name,
                     "timeout_mins": 60,
                     "disable_rollback": True,
                     "__param_param1": "some string",
                     "__param_param2": 42,
                     "__param_param3": '{"key": "value"}',
                     "__param_param4": "a,b,c",
                     "__param_param5": True,
                     'method': forms.CreateStackForm.__name__}
        res = self.client.post(url, form_data)
        self.assertRedirectsNoFollow(res, INDEX_URL)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template['data']))
        self.mock_stack_create.assert_called_once_with(
            test.IsHttpRequest(), stack_name=stack.stack_name,
            timeout_mins=60, disable_rollback=True,
            template=hc_format.parse(template['data']),
            parameters={'param1': 'some string',
                        'param2': 42,
                        'param3': '{"key": "value"}',
                        'param4': 'a,b,c',
                        'param5': True},
            password='password', files={})

    @test.create_mocks({api.heat: ('stack_update', 'stack_get', 'template_get',
                                   'template_validate'),
                        dashboard_api.neutron: ('network_list_for_tenant', )})
    def test_edit_stack_template(self):
        template = self.stack_templates.first()
        stack = self.stacks.first()

        self.mock_stack_get.return_value = stack
        self.mock_template_validate.return_value = \
            json.loads(template.validate)
        self.mock_stack_get.reutrn_value = stack
        self.mock_template_get.return_value = \
            json.loads(template.validate)

        fields = {
            'stack_name': stack.stack_name,
            'disable_rollback': True,
            'timeout_mins': 61,
            'password': 'password',
            'template': None,
            'parameters': test.IsA(dict),
            'files': None
        }
        self.mock_stack_update.return_value = None
        self.mock_network_list_for_tenant.return_value = \
            self.networks.list()

        url = reverse('horizon:project:stacks:change_template',
                      args=[stack.id])
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/change_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'method': forms.ChangeTemplateForm.__name__}
        res = self.client.post(url, form_data)

        url = reverse('horizon:project:stacks:edit_stack',
                      args=[stack.id, ])
        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'password': 'password',
                     'parameters': template.validate,
                     'stack_name': stack.stack_name,
                     'stack_id': stack.id,
                     "timeout_mins": 61,
                     "disable_rollback": True,
                     "__param_DBUsername": "admin",
                     "__param_LinuxDistribution": "F17",
                     "__param_InstanceType": "m1.small",
                     "__param_KeyName": "test",
                     "__param_DBPassword": "admin",
                     "__param_DBRootPassword": "admin",
                     "__param_DBName": "wordpress",
                     "__param_Network": self.networks.list()[0]['id'],
                     'method': forms.EditStackForm.__name__}
        res = self.client.post(url, form_data)
        self.assertRedirectsNoFollow(res, INDEX_URL)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template.data))
        self.mock_template_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id)
        self.mock_stack_update.assert_called_once_with(
            test.IsHttpRequest(), stack_id=stack.id,
            **fields)
        self.mock_network_list_for_tenant.assert_called_once_with(
            test.IsHttpRequest(), self.tenant.id)

    def test_launch_stack_form_invalid_name_digit(self):
        self._test_launch_stack_invalid_name('2_StartWithDigit')

    def test_launch_stack_form_invalid_name_underscore(self):
        self._test_launch_stack_invalid_name('_StartWithUnderscore')

    def test_launch_stack_form_invalid_name_point(self):
        self._test_launch_stack_invalid_name('.StartWithPoint')

    @test.create_mocks({dashboard_api.neutron: ('network_list_for_tenant', )})
    def _test_launch_stack_invalid_name(self, name):
        self.mock_network_list_for_tenant.return_value = \
            self.networks.list()

        template = self.stack_templates.first()
        url = reverse('horizon:project:stacks:launch')
        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'password': 'password',
                     'parameters': template.validate,
                     'stack_name': name,
                     "timeout_mins": 60,
                     "disable_rollback": True,
                     "__param_DBUsername": "admin",
                     "__param_LinuxDistribution": "F17",
                     "__param_InstanceType": "m1.small",
                     "__param_KeyName": "test",
                     "__param_DBPassword": "admin",
                     "__param_DBRootPassword": "admin",
                     "__param_DBName": "wordpress",
                     "__param_Network": self.networks.list()[0]['id'],
                     'method': forms.CreateStackForm.__name__}

        res = self.client.post(url, form_data)
        error = ('Name must start with a letter and may only contain letters, '
                 'numbers, underscores, periods and hyphens.')

        self.assertFormErrors(res, 1)
        self.assertFormError(res, "form", 'stack_name', error)

    @test.create_mocks({api.heat: ('stacks_list', 'action_check',)})
    def test_check_stack(self):
        stack = self.stacks.first()

        self.mock_stacks_list.return_value = \
            [self.stacks.list(), True, True]
        self.mock_action_check.return_value = stack

        form_data = {"action": "stacks__check__%s" % stack.id}
        res = self.client.post(INDEX_URL, form_data)

        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_mocks({api.heat: ('stacks_list', 'action_suspend',)})
    def test_suspend_stack(self):
        stack = self.stacks.first()

        self.mock_stacks_list.return_value = \
            [self.stacks.list(), True, True]
        self.mock_action_suspend.return_value = stack

        form_data = {"action": "stacks__suspend__%s" % stack.id}
        res = self.client.post(INDEX_URL, form_data)

        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_mocks({api.heat: ('stacks_list', 'action_resume',)})
    def test_resume_stack(self):
        stack = self.stacks.first()

        self.mock_stacks_list.return_value = \
            [self.stacks.list(), True, True]
        self.mock_action_resume.return_value = stack

        form_data = {"action": "stacks__resume__%s" % stack.id}
        res = self.client.post(INDEX_URL, form_data)

        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_mocks({api.heat: ('stack_preview', 'template_validate')})
    def test_preview_stack(self):
        template = self.stack_templates.first()
        stack = self.stacks.first()

        self.mock_template_validate.return_value = \
            json.loads(template.validate)
        self.mock_stack_preview.return_value = stack

        url = reverse('horizon:project:stacks:preview_template')
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'project/stacks/preview_template.html')

        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'method': forms.PreviewTemplateForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/preview.html')

        url = reverse('horizon:project:stacks:preview')
        form_data = {'template_source': 'raw',
                     'template_data': template.data,
                     'parameters': template.validate,
                     'stack_name': stack.stack_name,
                     "timeout_mins": 60,
                     "disable_rollback": True,
                     "__param_DBUsername": "admin",
                     "__param_LinuxDistribution": "F17",
                     "__param_InstanceType": "m1.small",
                     "__param_KeyName": "test",
                     "__param_DBPassword": "admin",
                     "__param_DBRootPassword": "admin",
                     "__param_DBName": "wordpress",
                     'method': forms.PreviewStackForm.__name__}
        res = self.client.post(url, form_data)
        self.assertTemplateUsed(res, 'project/stacks/preview_details.html')
        self.assertEqual(res.context['stack_preview']['stack_name'],
                         stack.stack_name)
        self.mock_template_validate.assert_called_once_with(
            test.IsHttpRequest(), files={},
            template=hc_format.parse(template.data))

    @test.create_mocks({api.heat: ('stack_get', 'template_get',
                                   'resources_list')})
    def test_detail_stack_topology(self):
        stack = self.stacks.first()
        template = self.stack_templates.first()
        self.mock_stack_get.return_value = stack
        self.mock_template_get.return_value = \
            json.loads(template.validate)
        self.mock_resources_list.return_value = []

        url = '?'.join([reverse(DETAIL_URL, args=[stack.id]),
                        '='.join(['tab', 'stack_details__stack_topology'])])
        res = self.client.get(url)
        tab = res.context['tab_group'].get_tab('topology')
        d3_data = tab.data['d3_data']
        self.assertEqual(tab.template_name,
                         'project/stacks/_detail_topology.html')
        # status is CREATE_COMPLETE, so we expect the topology to display it
        self.assertIn('info_box', d3_data)
        self.assertIn('stack-green.svg', d3_data)
        self.assertIn('Create Complete', d3_data)
        self.mock_template_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id)
        self.mock_resources_list.assert_called_once_with(
            test.IsHttpRequest(), stack.stack_name)

    @test.create_mocks({api.heat: ('stack_get', 'template_get',
                                   'resources_list')})
    def test_detail_stack_overview(self):
        stack = self.stacks.first()
        template = self.stack_templates.first()
        self.mock_stack_get.return_value = stack
        self.mock_resources_list.return_value = []
        self.mock_template_get.return_value = \
            json.loads(template.validate)

        url = '?'.join([reverse(DETAIL_URL, args=[stack.id]),
                        '='.join(['tab', 'stack_details__stack_overview'])])
        res = self.client.get(url)
        tab = res.context['tab_group'].get_tab('overview')
        overview_data = tab.data['stack']
        self.assertEqual(tab.template_name,
                         'project/stacks/_detail_overview.html')
        self.assertEqual(stack.stack_name, overview_data.stack_name)
        self.mock_template_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id)

    @test.create_mocks({api.heat: ('stack_get', 'template_get',
                                   'resources_list')})
    def test_detail_stack_resources(self):
        stack = self.stacks.first()
        template = self.stack_templates.first()
        self.mock_stack_get.return_value = stack
        self.mock_resources_list.return_value = []
        self.mock_template_get.return_value = \
            json.loads(template.validate)

        url = '?'.join([reverse(DETAIL_URL, args=[stack.id]),
                        '='.join(['tab', 'stack_details__resource_overview'])])
        res = self.client.get(url)
        tab = res.context['tab_group'].get_tab('resources')
        self.assertEqual(tab.template_name,
                         'project/stacks/_detail_resources.html')

    @test.create_mocks({api.heat: ('stack_get', 'template_get')})
    def test_detail_stack_template(self):
        stack = self.stacks.first()
        template = self.stack_templates.first()
        self.mock_stack_get.return_value = stack
        self.mock_template_get.return_value = \
            json.loads(template.validate)

        url = '?'.join([reverse(DETAIL_URL, args=[stack.id]),
                        '='.join(['tab', 'stack_details__stack_template'])])
        res = self.client.get(url)
        tab = res.context['tab_group'].get_tab('stack_template')
        template_data = tab.data['stack_template']
        self.assertEqual(tab.template_name,
                         'project/stacks/_stack_template.html')
        self.assertIn(json.loads(template.validate)['Description'],
                      template_data)
        self.mock_stack_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id)
        self.mock_template_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id)

    @test.create_mocks({api.heat: ('resource_get', 'resource_metadata_get')})
    def test_resource_view(self):
        stack = self.stacks.first()
        resource = self.heat_resources.first()
        metadata = {}
        self.mock_resource_get.return_value = resource
        self.mock_resource_metadata_get.return_value = metadata

        url = reverse('horizon:project:stacks:resource',
                      args=[stack.id, resource.resource_name])
        res = self.client.get(url)
        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertTemplateUsed(res, 'project/stacks/_resource_overview.html')
        self.assertEqual(res.context['resource'].logical_resource_id,
                         resource.logical_resource_id)
        self.mock_resource_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id, resource.resource_name)
        self.mock_resource_get.assert_called_once_with(
            test.IsHttpRequest(), stack.id, resource.resource_name)


class TemplateFormTests(test.TestCase):

    class SimpleFile(object):
        def __init__(self, name, data):
            self.name = name
            self.data = data

        def read(self):
            return self.data

    def test_create_upload_form_attributes(self):
        attrs = forms.create_upload_form_attributes(
            'env', 'url', 'Environment')
        self.assertEqual(attrs['data-envsource-url'], 'Environment')

    def test_clean_file_upload_form_url(self):
        kwargs = {'next_view': 'Launch Stack'}
        t = forms.TemplateForm({}, **kwargs)
        precleaned = {
            'template_url': 'http://templateurl.com',
        }
        t.clean_uploaded_files('template', 'template', precleaned, {})

        self.assertEqual(precleaned['template_url'], 'http://templateurl.com')

    def test_clean_file_upload_form_multiple(self):
        kwargs = {'next_view': 'Launch Stack'}
        t = forms.TemplateForm({}, **kwargs)
        precleaned = {
            'template_url': 'http://templateurl.com',
            'template_data': 'http://templateurl.com',
        }
        self.assertRaises(
            exceptions.ValidationError,
            t.clean_uploaded_files,
            'template',
            'template',
            precleaned,
            {})

    def test_clean_file_upload_form_invalid_json(self):
        kwargs = {'next_view': 'Launch Stack'}
        t = forms.TemplateForm({}, **kwargs)
        precleaned = {
            'template_data': 'http://templateurl.com',
        }
        json_str = '{notvalidjson::::::json/////json'
        files = {'template_upload':
                 self.SimpleFile('template_name', json_str.encode('utf-8'))}

        self.assertRaises(
            exceptions.ValidationError,
            t.clean_uploaded_files,
            'template',
            'template',
            precleaned,
            files)

    def test_clean_file_upload_form_valid_data(self):
        kwargs = {'next_view': 'Launch Stack'}
        t = forms.TemplateForm({}, **kwargs)
        precleaned = {
            'template_data': 'http://templateurl.com',
        }

        json_str = '{"isvalid":"json"}'
        files = {'template_upload':
                 self.SimpleFile('template_name', json_str.encode('utf-8'))}

        t.clean_uploaded_files('template', 'template', precleaned, files)
        self.assertEqual(
            json_str,
            precleaned['template_data'])
