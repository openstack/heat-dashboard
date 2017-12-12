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

from mox3.mox import IsA

from django.core.urlresolvers import reverse
from django import http
from openstack_dashboard import api as dashboard_api

from heat_dashboard import api
from heat_dashboard.test import helpers as test


class TemplateGeneratorTests(test.TestCase):

    def test_index(self):
        self.client.get(reverse('horizon:project:template_generator:index'))
        self.assertTemplateUsed(
            template_name='project/template_generator/index.html')

    @test.create_stubs({
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

        dashboard_api.cinder.volume_list(
            IsA(http.HttpRequest)).AndReturn(volumes)
        dashboard_api.cinder.volume_snapshot_list(
            IsA(http.HttpRequest)).AndReturn(volume_snapshots)
        dashboard_api.cinder.volume_type_list(
            IsA(http.HttpRequest)).AndReturn(volume_types)
        dashboard_api.cinder.volume_backup_list(
            IsA(http.HttpRequest)).AndReturn(volume_backups)
        dashboard_api.glance.image_list_detailed(
            IsA(http.HttpRequest)).AndReturn(images)
        dashboard_api.neutron.network_list(
            IsA(http.HttpRequest)).AndReturn(networks)
        dashboard_api.neutron.subnet_list(
            IsA(http.HttpRequest)).AndReturn(subnets)
        dashboard_api.neutron.tenant_floating_ip_list(
            IsA(http.HttpRequest), True).AndReturn(floating_ips)
        dashboard_api.neutron.port_list(
            IsA(http.HttpRequest)).AndReturn(ports)
        dashboard_api.neutron.security_group_list(
            IsA(http.HttpRequest)).AndReturn(security_groups)
        dashboard_api.neutron.router_list(
            IsA(http.HttpRequest)).AndReturn(routers)
        dashboard_api.neutron.policy_list(
            IsA(http.HttpRequest)).AndReturn(qos_policies)
        dashboard_api.nova.availability_zone_list(
            IsA(http.HttpRequest)).AndReturn(availability_zones)
        dashboard_api.nova.flavor_list(
            IsA(http.HttpRequest)).AndReturn(flavors)
        dashboard_api.nova.server_list(
            IsA(http.HttpRequest)).AndReturn(instances)
        dashboard_api.nova.keypair_list(
            IsA(http.HttpRequest)).AndReturn(keypairs)
        api.heat.template_version_list(
            IsA(http.HttpRequest)).AndReturn(template_versions)
        self.mox.ReplayAll()

        resp = self.client.get(reverse(
            'horizon:project:template_generator:apis'))
        data = resp.content
        if isinstance(data, bytes):
            data = data.decode('utf-8')
        json_data = json.loads(data)
        self.assertEqual(len(json_data.keys()), 20)
