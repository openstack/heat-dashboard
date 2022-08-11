# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 Nebula, Inc.
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

from importlib import import_module
import os
import traceback
import unittest
from unittest import mock
from urllib import parse

import django
from django.conf import settings
from django.contrib.messages.storage import default_storage
from django.core.handlers import wsgi
from django.test.client import RequestFactory

from heatclient import client as heat_client
from keystoneclient.v2_0 import client as keystone_client
from neutronclient.v2_0 import client as neutron_client
from openstack_auth import user
from openstack_auth import utils
from requests.packages.urllib3.connection import HTTPConnection

from horizon.test import helpers as horizon_helpers

from openstack_dashboard import api as project_api
from openstack_dashboard import context_processors
from openstack_dashboard.test import helpers

from heat_dashboard import api
from heat_dashboard.test.test_data import utils as test_utils

# Makes output of failing mox tests much easier to read.
wsgi.WSGIRequest.__repr__ = lambda self: "<class 'django.http.HttpRequest'>"

# Shortcuts to avoid importing openstack_dashboard.test.helper and
# for backwards compatibility.
create_mocks = helpers.create_mocks
IsA = helpers.IsA
IsHttpRequest = helpers.IsHttpRequest


def _apply_panel_mocks(patchers=None):
    """Global mocks on panels that get called on all views."""
    if patchers is None:
        patchers = {}
    mocked_methods = getattr(settings, 'TEST_GLOBAL_MOCKS_ON_PANELS', {})
    for name, mock_config in mocked_methods.items():
        method = mock_config['method']
        mock_params = {}
        for param in ['return_value', 'side_effect']:
            if param in mock_config:
                mock_params[param] = mock_config[param]
        patcher = mock.patch(method, **mock_params)
        patcher.start()
        patchers[name] = patcher
    return patchers


class RequestFactoryWithMessages(RequestFactory):
    def get(self, *args, **kwargs):
        req = super(RequestFactoryWithMessages, self).get(*args, **kwargs)
        req.user = utils.get_user(req)
        req.session = []
        req._messages = default_storage(req)
        return req

    def post(self, *args, **kwargs):
        req = super(RequestFactoryWithMessages, self).post(*args, **kwargs)
        req.user = utils.get_user(req)
        req.session = []
        req._messages = default_storage(req)
        return req


@unittest.skipIf(os.environ.get('SKIP_UNITTESTS', False),
                 "The SKIP_UNITTESTS env variable is set.")
class TestCase(horizon_helpers.TestCase):
    """Specialized base test case class for Horizon.

    It gives access to numerous additional features:

    * A full suite of test data through various attached objects and
      managers (e.g. ``self.servers``, ``self.user``, etc.). See the
      docs for
      :class:`~openstack_dashboard.test.test_data.utils.TestData`
      for more information.
    * The ``mox`` mocking framework via ``self.mox``.
    * A set of request context data via ``self.context``.
    * A ``RequestFactory`` class which supports Django's ``contrib.messages``
      framework via ``self.factory``.
    * A ready-to-go request object via ``self.request``.
    * The ability to override specific time data controls for easier testing.
    * Several handy additional assertion methods.
    """

    # To force test failures when unmocked API calls are attempted, provide
    # boolean variable to store failures
    missing_mocks = False

    def fake_conn_request(self):
        # print a stacktrace to illustrate where the unmocked API call
        # is being made from
        traceback.print_stack()
        # forcing a test failure for missing mock
        self.missing_mocks = True

    def setUp(self):
        self._real_conn_request = HTTPConnection.connect
        HTTPConnection.connect = self.fake_conn_request

        self._real_context_processor = context_processors.openstack
        context_processors.openstack = lambda request: self.context

        self.patchers = _apply_panel_mocks()

        super(TestCase, self).setUp()

    def _setup_test_data(self):
        super(TestCase, self)._setup_test_data()
        test_utils.load_test_data(self)
        self.context = {
            'authorized_tenants': self.tenants.list(),
            'JS_CATALOG': context_processors.get_js_catalog(settings),
        }

    def _setup_factory(self):
        # For some magical reason we need a copy of this here.
        self.factory = RequestFactoryWithMessages()

    def _setup_user(self, **kwargs):
        self._real_get_user = utils.get_user
        tenants = self.context['authorized_tenants']
        base_kwargs = {
            'id': self.user.id,
            'token': self.token,
            'username': self.user.name,
            'domain_id': self.domain.id,
            'user_domain_name': self.domain.name,
            'tenant_id': self.tenant.id,
            'service_catalog': self.service_catalog,
            'authorized_tenants': tenants
        }
        base_kwargs.update(kwargs)
        self.setActiveUser(**base_kwargs)

    def _setup_request(self):
        super(TestCase, self)._setup_request()
        self.request.session['token'] = self.token.id

    def tearDown(self):
        HTTPConnection.connect = self._real_conn_request
        context_processors.openstack = self._real_context_processor
        utils.get_user = self._real_get_user
        mock.patch.stopall()
        super(TestCase, self).tearDown()

        # cause a test failure if an unmocked API call was attempted
        if self.missing_mocks:
            raise AssertionError("An unmocked API call was made.")

    def setActiveUser(self, id=None, token=None, username=None, tenant_id=None,
                      service_catalog=None, tenant_name=None, roles=None,
                      authorized_tenants=None, enabled=True, domain_id=None,
                      user_domain_name=None):
        def get_user(request):
            ret = user.User(id=id,
                            token=token,
                            user=username,
                            domain_id=domain_id,
                            user_domain_name=user_domain_name,
                            tenant_id=tenant_id,
                            tenant_name=tenant_name,
                            service_catalog=service_catalog,
                            roles=roles,
                            enabled=enabled,
                            authorized_tenants=authorized_tenants,
                            endpoint=settings.OPENSTACK_KEYSTONE_URL)
            ret._is_system_user = False
            return ret
        utils.get_user = get_user

    def assertRedirectsNoFollow(self, response, expected_url):
        """Check for redirect.

        Asserts that the given response issued a 302 redirect without
        processing the view which is redirected to.
        """
        if django.VERSION >= (1, 9):
            if response.has_header('location'):
                loc = response['location']
            else:
                loc = ''
            loc = parse.unquote(loc)
            expected_url = parse.unquote(expected_url)
            self.assertEqual(loc, expected_url)
        else:
            self.assertEqual(response._headers.get('location', None),
                             ('Location', settings.TESTSERVER + expected_url))
        self.assertEqual(response.status_code, 302)

    def assertNoFormErrors(self, response, context_name="form"):
        """Checks for no form errors.

        Asserts that the response either does not contain a form in its
        context, or that if it does, that form has no errors.
        """
        context = getattr(response, "context", {})
        if not context or context_name not in context:
            return True
        errors = response.context[context_name]._errors
        assert len(errors) == 0, \
            "Unexpected errors were found on the form: %s" % errors

    def assertFormErrors(self, response, count=0, message=None,
                         context_name="form"):
        """Check for form errors.

        Asserts that the response does contain a form in its
        context, and that form has errors, if count were given,
        it must match the exact numbers of errors
        """
        context = getattr(response, "context", {})
        assert (context and context_name in context), \
            "The response did not contain a form."
        errors = response.context[context_name]._errors
        if count:
            assert len(errors) == count, \
                "%d errors were found on the form, %d expected" % \
                (len(errors), count)
            if message and message not in str(errors):
                self.fail("Expected message not found, instead found: %s"
                          % ["%s: %s" % (key, [e for e in field_errors]) for
                             (key, field_errors) in errors.items()])
        else:
            assert len(errors) > 0, "No errors were found on the form"

    def assertStatusCode(self, response, expected_code):
        """Validates an expected status code.

        Matches camel case of other assert functions
        """
        if response.status_code == expected_code:
            return
        self.fail('status code %r != %r: %s' % (response.status_code,
                                                expected_code,
                                                response.content))

    def assertItemsCollectionEqual(self, response, items_list):
        self.assertEqual(response.json, {"items": items_list})

    def getAndAssertTableRowAction(self, response, table_name,
                                   action_name, row_id):
        table = response.context[table_name + '_table']
        rows = list(filter(lambda x: x.id == row_id,
                           table.data))
        self.assertEqual(1, len(rows),
                         "Did not find a row matching id '%s'" % row_id)
        row_actions = table.get_row_actions(rows[0])
        actions = list(filter(lambda x: x.name == action_name,
                              row_actions))

        msg_args = (action_name, table_name, row_id)
        self.assertGreater(
            len(actions), 0,
            "No action named '%s' found in '%s' table for id '%s'" % msg_args)

        self.assertEqual(
            1, len(actions),
            "Multiple actions named '%s' found in '%s' table for id '%s'"
            % msg_args)

        return actions[0]

    def getAndAssertTableAction(self, response, table_name, action_name):

        table = response.context[table_name + '_table']
        table_actions = table.get_table_actions()
        actions = list(filter(lambda x: x.name == action_name,
                              table_actions))
        msg_args = (action_name, table_name)
        self.assertGreater(
            len(actions), 0,
            "No action named '%s' found in '%s' table" % msg_args)

        self.assertEqual(
            1, len(actions),
            "More than one action named '%s' found in '%s' table" % msg_args)

        return actions[0]

    @staticmethod
    def mock_rest_request(**args):
        mock_args = {
            'user.is_authenticated.return_value': True,
            'policy.check.return_value': True,
            'body': ''
        }
        mock_args.update(args)
        return mock.Mock(**mock_args)


class BaseAdminViewTests(TestCase):
    """Sets an active user with the "admin" role.

    For testing admin-only views and functionality.
    """

    def setActiveUser(self, *args, **kwargs):
        if "roles" not in kwargs:
            kwargs['roles'] = [self.roles.admin._info]
        super(BaseAdminViewTests, self).setActiveUser(*args, **kwargs)

    def setSessionValues(self, **kwargs):
        settings.SESSION_ENGINE = 'django.contrib.sessions.backends.file'
        engine = import_module(settings.SESSION_ENGINE)
        store = engine.SessionStore()
        for key in kwargs:
            store[key] = kwargs[key]
            self.request.session[key] = kwargs[key]
        store.save()
        self.session = store
        self.client.cookies[settings.SESSION_COOKIE_NAME] = store.session_key


class APITestCase(TestCase):
    """Testing APIs.

    For use with tests which deal with the underlying clients rather than
    stubbing out the openstack_dashboard.api.* methods.
    """

    def setUp(self):
        super(APITestCase, self).setUp()
        utils.patch_middleware_get_user()

        def fake_keystoneclient(request, admin=False):
            """Returns the stub keystoneclient.

            Only necessary because the function takes too many arguments to
            conveniently be a lambda.
            """
            return self.stub_keystoneclient()

        # Store the original clients
        self._original_keystoneclient = project_api.keystone.keystoneclient
        self._original_heatclient = api.heat.heatclient

        # Replace the clients with our stubs.
        project_api.keystone.keystoneclient = fake_keystoneclient
        api.heat.heatclient = (lambda request, password=None:
                               self.stub_heatclient())

    def tearDown(self):
        super(APITestCase, self).tearDown()
        project_api.keystone.keystoneclient = self._original_keystoneclient
        api.heat.heatclient = self._original_heatclient

    def stub_keystoneclient(self):
        if not hasattr(self, "keystoneclient"):
            keystone_client.Client = mock.Mock()
            # NOTE(saschpe): Mock properties, MockObject.__init__ ignores them:
            keystone_client.Client.auth_token = 'foo'
            keystone_client.Client.service_catalog = None
            keystone_client.Client.tenant_id = '1'
            keystone_client.Client.tenant_name = 'tenant_1'
            keystone_client.Client.management_url = ""
            keystone_client.Client.__dir__ = lambda: []
            self.keystoneclient = keystone_client.Client
        return self.keystoneclient

    def stub_neutronclient(self):
        if not hasattr(self, "neutronclient"):
            neutron_client.Client = mock.Mock()
            self.neutronclient = neutron_client.Client
        return self.neutronclient

    def stub_heatclient(self):
        if not hasattr(self, "heatclient"):
            heat_client.Client = mock.Mock()
            self.heatclient = heat_client.Client
        return self.heatclient


class RestAPITestCase(TestCase):
    def setUp(self):
        super().setUp()
        mock.patch('horizon.utils.http.is_ajax', return_value=True).start()


# Need this to test both Glance API V1 and V2 versions
class ResetImageAPIVersionMixin(object):

    def setUp(self):
        super(ResetImageAPIVersionMixin, self).setUp()
        project_api.glance.VERSIONS.clear_active_cache()

    def tearDown(self):
        project_api.glance.VERSIONS.clear_active_cache()
        super(ResetImageAPIVersionMixin, self).tearDown()
