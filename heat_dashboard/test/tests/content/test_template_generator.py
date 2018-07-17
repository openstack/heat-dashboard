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

import json

from django.urls import reverse
from openstack_dashboard import api as dashboard_api

from heat_dashboard import api
from heat_dashboard.test import helpers as test


class TemplateGeneratorTests(test.TestCase):

    def test_index(self):
        self.client.get(reverse('horizon:project:template_generator:index'))
        self.assertTemplateUsed(
            template_name='project/template_generator/index.html')

    @test.create_mocks({
        api.heat: ('template_version_list', ),
        dashboard_api.neutron: (
            'network_list', 'subnet_list', 'tenant_floating_ip_list',
            'port_list', 'security_group_list', 'router_list', 'policy_list'),
        dashboard_api.cinder: (
            'volume_list', 'volume_snapshot_list',
            'volume_type_list', 'volume_backup_list'),
        dashboard_api.glance: ('image_list_detailed', ),
        dashboard_api.nova: ('availability_zone_list', 'flavor_list',
                             'server_list', 'keypair_list')})
    def test_option(self):
        volumes = self.cinder_volumes.list()
        volume_snapshots = self.cinder_volume_snapshots.list()
        volume_types = self.cinder_volume_types.list()
        volume_backups = self.cinder_volume_backups.list()
        images = self.imagesV2.list()
        networks = self.networks.list()
        subnets = self.subnets.list()
        floating_ips = self.floating_ips.list()
        ports = self.ports.list()
        security_groups = self.security_groups.list()
        routers = self.routers.list()
        qos_policies = self.qos_policies.list()
        availability_zones = self.availability_zones.list()
        flavors = self.flavors.list()
        instances = self.servers.list()
        keypairs = self.keypairs.list()
        template_versions = self.template_versions.list()

        self.mock_volume_list.return_value = volumes
        self.mock_volume_snapshot_list.return_value = volume_snapshots
        self.mock_volume_type_list.return_vlue = volume_types
        self.mock_volume_backup_list.return_value = volume_backups
        self.mock_image_list_detailed.return_value = images
        self.mock_network_list.return_value = networks
        self.mock_subnet_list.return_value = subnets
        self.mock_tenant_floating_ip_list.return_value = floating_ips
        self.mock_port_list.return_value = ports
        self.mock_security_group_list.return_value = security_groups
        self.mock_router_list.return_value = routers
        self.mock_policy_list.return_value = qos_policies
        self.mock_availability_zone_list.return_value = availability_zones
        self.mock_flavor_list.return_value = flavors
        self.mock_server_list.return_value = instances
        self.mock_keypair_list.return_value = keypairs
        self.mock_template_version_list.return_value = template_versions

        resp = self.client.get(reverse(
            'horizon:project:template_generator:apis'))
        data = resp.content
        if isinstance(data, bytes):
            data = data.decode('utf-8')
        json_data = json.loads(data)
        self.assertEqual(len(json_data.keys()), 20)

        self.mock_volume_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_volume_snapshot_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_volume_type_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_volume_backup_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_image_list_detailed.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_network_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_subnet_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_tenant_floating_ip_list.assert_called_once_with(
            test.IsHttpRequest(), True)
        self.mock_port_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_security_group_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_router_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_policy_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_availability_zone_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_flavor_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_server_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_keypair_list.assert_called_once_with(
            test.IsHttpRequest())
        self.mock_template_version_list.assert_called_once_with(
            test.IsHttpRequest())
