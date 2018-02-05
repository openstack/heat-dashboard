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

from functools import wraps
from multiprocessing import pool

from django.conf import settings
from openstack_dashboard import api as dashboard_api

from heat_dashboard import api as heat_api


try:
    API_TIMEOUT = settings.API_TIMEOUT
except AttributeError:
    API_TIMEOUT = 60

try:
    API_PARALLEL = settings.API_PARALLEL
except AttributeError:
    API_PARALLEL = 2


def handle_exception(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        ret, err = None, None
        try:
            ret = func(*args, **kwargs)
        except Exception as error:
            err = error.message
        return ret if ret else [], err
    return wrapped


@handle_exception
def get_networks(request):
    return dashboard_api.neutron.network_list(request)


@handle_exception
def get_subnets(request):
    return dashboard_api.neutron.subnet_list(request)


@handle_exception
def get_volume_ids(request):
    return [{'id': vol.id,
             'name': vol.name if vol.name else '(%s)' % vol.id}
            for vol in dashboard_api.cinder.volume_list(request)]


@handle_exception
def get_volume_snapshots(request):
    return [{'id': volsnap.id,
             'name': volsnap.name if volsnap.name else '(%s)' % volsnap.id[:6]}
            for volsnap in dashboard_api.cinder.volume_snapshot_list(request)]


@handle_exception
def get_volume_types(request):
    return [{'id': voltype.id,
             'name': voltype.name if voltype.name else '(%s)' % voltype.id[:6]}
            for voltype in dashboard_api.cinder.volume_type_list(request)]


@handle_exception
def get_volume_backups(request):
    return [{'id': volbackup.id,
             'name': volbackup.name
             if volbackup.name else '(%s)' % volbackup.id[:6]}
            for volbackup in dashboard_api.cinder.volume_backup_list(request)]


@handle_exception
def get_images(request):
    images = dashboard_api.glance.image_list_detailed(request)
    if isinstance(images, tuple):
        images = images[0]
    return [{'id': img.id,
             'name': img.name if img.name else '(%s)' % img.id[:6]}
            for img in images]


@handle_exception
def get_floatingips(request):
    return [{'id': fip.id, 'name': fip.floating_ip_address}
            for fip in dashboard_api.neutron.tenant_floating_ip_list(
                request, True)]


@handle_exception
def get_ports(request):
    return [{'id': port.id,
             'name': port.name if port.name else '(%s)' % port.id[:6]}
            for port in dashboard_api.neutron.port_list(request)]


@handle_exception
def get_security_groups(request):
    return [{'id': secgroup.id,
             'name': secgroup.name
             if secgroup.name else '(%s)' % secgroup.id[:6]}
            for secgroup in dashboard_api.neutron.security_group_list(request)]


@handle_exception
def get_routers(request):
    return [{'id': router.id,
             'name': router.name if router.name else '(%s)' % router.id[:6]}
            for router in dashboard_api.neutron.router_list(request)]


@handle_exception
def get_qos_policies(request):
    return [{'id': policy.id,
             'name': policy.name
             if policy.name else '(%s)' % policy.id[:6]}
            for policy in dashboard_api.neutron.policy_list(request)]


@handle_exception
def get_availability_zones(request):
    return [{'id': az.zoneName, 'name': az.zoneName}
            for az in dashboard_api.nova.availability_zone_list(request)]


@handle_exception
def get_flavors(request):
    return [{'id': flavor.name, 'name': flavor.name}
            for flavor in dashboard_api.nova.flavor_list(request)]


@handle_exception
def get_instances(request):
    servers = dashboard_api.nova.server_list(request)
    if isinstance(servers, tuple):
        servers = servers[0]
    return [{'id': server.id,
             'name': server.name if server.name else '(%s)' % server.id[:6]}
            for server in servers]


@handle_exception
def get_keypairs(request):
    return [{'name': keypair.name}
            for keypair in dashboard_api.nova.keypair_list(request)]


@handle_exception
def get_template_versions(request):
    return [{'name': version.version, 'id': version.version}
            for version in heat_api.heat.template_version_list(request)
            if version.type == 'hot']


class APIThread(object):
    thread_pool = pool.ThreadPool(processes=API_PARALLEL)
    async_results = {}

    def add_thread(self, apikey, func, args):
        self.async_results[apikey] = self.thread_pool.apply_async(func, args)

    def get_async_result(self, apikey):
        if apikey not in self.async_results:
            return [], None
        try:
            ret, err = self.async_results[apikey].get(
                timeout=API_TIMEOUT)
        except Exception as error:
            ret, err = [], error.message
        return ret, err


def _get_network_resources(options, all_networks):
    try:
        if all_networks:
            options['networks'] = [
                {'id': nw.id,
                 'name': nw.name if nw.name else '(%s)' % nw.id[: 6]}
                for nw in all_networks if not getattr(nw, 'router:external')]
            options['floating_networks'] = [
                {'id': nw.id,
                 'name': nw.name if nw.name else '(%s)' % nw.id[: 6]}
                for nw in all_networks if getattr(nw, 'router:external')]
        else:
            options['networks'] = []
            options['floating_networks'] = []
    except Exception:
        options['networks'] = []
        options['floating_networks'] = []


def _get_subnet_resources(options, all_subnets):
    try:
        if all_subnets and options.get('floating_networks'):
            floating_network_ids = [nw.get('id')
                                    for nw in options['floating_networks']]
            options['subnets'] = [{'id': sb.id, 'name': sb.name}
                                  for sb in all_subnets
                                  if sb.network_id not in floating_network_ids]

            options['floating_subnets'] = [
                {'id': subnet.id, 'name': subnet.name}
                for subnet in all_subnets
                if subnet.network_id in floating_network_ids]
        else:
            options['subnets'] = []
            options['floating_subnets'] = []
    except Exception:
        options['subnets'] = []
        options['floating_subnets'] = []


def get_resource_options(request):
    api_threads = APIThread()
    api_mapping = {
        'volumes': get_volume_ids,
        'volume_snapshots': get_volume_snapshots,
        'volume_types': get_volume_types,
        'volume_backups': get_volume_backups,
        'images': get_images,
        'floatingips': get_floatingips,
        'networks': get_networks,
        'subnets': get_subnets,
        'ports': get_ports,
        'security_groups': get_security_groups,
        'routers': get_routers,
        'qos_policies': get_qos_policies,
        'availability_zones': get_availability_zones,
        'flavors': get_flavors,
        'instances': get_instances,
        'keypairs': get_keypairs,
        'template_versions': get_template_versions,
    }

    options = {}
    errors = {}

    for resource, method in api_mapping.items():
        api_threads.add_thread(resource, method, args=(request,))

    for resource in api_mapping.keys():
        ret, err = api_threads.get_async_result(resource)
        options[resource] = ret
        if err:
            errors[resource.replace('_', ' ').capitalize()] = err

    all_networks = options.pop('networks')
    _get_network_resources(options, all_networks)

    all_subnets = options.pop('subnets')
    _get_subnet_resources(options, all_subnets)

    role_names = []
    for role in request.user.roles:
        role_names.append(role.get('name'))
    options.update({
        'auth': {
            'tenant_id': request.user.tenant_id,
            'admin': 'admin' in role_names,
        },
    })

    if len(errors.keys()) > 0:
        options.update({'errors': errors})

    return json.dumps(options)
