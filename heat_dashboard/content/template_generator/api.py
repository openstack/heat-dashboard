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

from openstack_dashboard import api as dashboard_api
from openstack_dashboard.api.neutron import neutronclient

from heat_dashboard import api


def get_resources(request):

    volumes = [
        vol.to_dict() for vol in dashboard_api.cinder.volume_list(request)]
    volume_snapshots = [
        volsnap.to_dict()
        for volsnap in dashboard_api.cinder.volume_snapshot_list(request)]
    volume_types = [
        voltype.to_dict()
        for voltype in dashboard_api.cinder.volume_type_list(request)]
    volume_backups = [
        volbackup.to_dict()
        for volbackup in dashboard_api.cinder.volume_backup_list(request)]

    images = [
        img.to_dict()
        for img in dashboard_api.glance.image_list_detailed(request)[0]]

    neutron_client = neutronclient(request)
    floatingips = neutron_client.list_floatingips().get('floatingips')
    networks = neutron_client.list_networks().get('networks')
    ports = neutron_client.list_ports().get('ports')
    security_groups = \
        neutron_client.list_security_groups().get('security_groups')
    subnets = neutron_client.list_subnets().get('subnets')
    routers = neutron_client.list_routers().get('routers')
    # qos_policies = neutron_client.list_security_groups().get('ports')

    availability_zones = \
        [az.to_dict()
         for az in dashboard_api.nova.availability_zone_list(request)]
    flavors = \
        [flavor.to_dict()
         for flavor in dashboard_api.nova.flavor_list(request)]
    instances = \
        [server.to_dict()
         for server in dashboard_api.nova.server_list(request)[0]]
    keypairs = \
        [keypair.to_dict()
         for keypair in dashboard_api.nova.keypair_list(request)]

    opts = {
        'user_roles': request.user.roles,
        'volumes': volumes,
        'volume_snapshots': volume_snapshots,
        'volume_types': volume_types,
        'volume_backups': volume_backups,
        'images': images,
        'floatingips': floatingips,
        'networks': networks,
        'ports': ports,
        'security_groups': security_groups,
        'subnets': subnets,
        'routers': routers,
        # 'qos_policies': qos_policies,
        'availability_zones': availability_zones,
        'flavors': flavors,
        'instances': instances,
        'keypairs': keypairs,
    }

    return json.dumps(opts)


def get_resource_options(request):

    volumes = [{'id': vol.id,
                'name': vol.name if vol.name else '(%s)' % vol.id}
               for vol in dashboard_api.cinder.volume_list(request)]
    volume_snapshots = [
        {'id': volsnap.id,
         'name': volsnap.name if volsnap.name else '(%s)' % volsnap.id[:6]}
        for volsnap in dashboard_api.cinder.volume_snapshot_list(request)]
    volume_types = [{
        'id': voltype.id,
        'name': voltype.name if voltype.name else '(%s)' % voltype.id[:6]}
        for voltype in dashboard_api.cinder.volume_type_list(request)]
    volume_backups = [
        {'id': volbackup.id,
         'name': volbackup.name
         if volbackup.name else '(%s)' % volbackup.id[:6]}
        for volbackup in dashboard_api.cinder.volume_backup_list(request)]

    images = [
        {'id': img.id,
         'name': img.name if img.name else '(%s)' % img.id[:6]}
        for img in dashboard_api.glance.image_list_detailed(request)[0]]

    floatingips = [
        {'id': fip.id, 'name': fip.floating_ip_address}
        for fip in dashboard_api.neutron.tenant_floating_ip_list(
            request, True)]
    all_networks = dashboard_api.neutron.network_list(request)
    networks = [{'id': nw.id,
                 'name': nw.name if nw.name else '(%s)' % nw.id[:6]}
                for nw in all_networks if not nw['router:external']]
    floating_networks = [{'id': nw.id,
                          'name': nw.name if nw.name else '(%s)' % nw.id[:6]}
                         for nw in all_networks if nw['router:external']]
    floating_network_ids = [nw.get('id') for nw in floating_networks]

    ports = [{'id': port.id,
              'name': port.name if port.name else '(%s)' % port.id[:6]}
             for port in dashboard_api.neutron.port_list(request)]
    security_groups = [
        {'id': secgroup.id,
         'name': secgroup.name
         if secgroup.name else '(%s)' % secgroup.id[:6]}
        for secgroup in dashboard_api.neutron.security_group_list(request)]
    all_subnets = dashboard_api.neutron.subnet_list(request)
    subnets = [
        {'id': subnet.id,
         'name': subnet.name if subnet.name else '(%s)' % subnet.id[:6]}
        for subnet in all_subnets]

    floating_subnets = [{'id': subnet.id, 'name': subnet.name}
                        for subnet in all_subnets
                        if subnet.network_id in floating_network_ids]

    routers = [
        {'id': router.id,
         'name': router.name if router.name else '(%s)' % router.id[:6]}
        for router in dashboard_api.neutron.router_list(request)]
    qos_policies = []
    # qos_policies = [
    #     {'id': policy.id,
    #      'name': policy.name
    #      if policy.name else '(%s)' % policy.id[:6]}
    #     for policy in dashboard_api.neutron.policy_list(request)]

    availability_zones = [
        {'id': az.zoneName, 'name': az.zoneName}
        for az in dashboard_api.nova.availability_zone_list(request)]
    flavors = [{'id': flavor.name, 'name': flavor.name}
               for flavor in dashboard_api.nova.flavor_list(request)]
    instances = [{'id': server.id,
                  'name': server.name
                  if server.name else '(%s)' % server.id[:6]}
                 for server in dashboard_api.nova.server_list(request)[0]]
    keypairs = [{'name': keypair.name}
                for keypair in dashboard_api.nova.keypair_list(request)]

    template_versions = [
        {'name': version.version, 'id': version.version}
        for version in api.heat.template_version_list(request)
        if version.type == 'hot']

    opts = {
        'auth': {
            'tenant_id': request.user.tenant_id,
            'admin': request.user.roles[0]['name'] == 'admin',
        },
        'volumes': volumes,
        'volume_snapshots': volume_snapshots,
        'volume_types': volume_types,
        'volume_backups': volume_backups,
        'images': images,
        'floatingips': floatingips,
        'floating_networks': floating_networks,
        'floating_subnets': floating_subnets,
        'networks': networks,
        'ports': ports,
        'security_groups': security_groups,
        'subnets': subnets,
        'routers': routers,
        'qos_policies': qos_policies,
        'availability_zones': availability_zones,
        'flavors': flavors,
        'instances': instances,
        'keypairs': keypairs,
        'template_versions': template_versions,
    }

    return json.dumps(opts)
