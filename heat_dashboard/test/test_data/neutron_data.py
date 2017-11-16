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

import copy

from openstack_dashboard.api import neutron

from heat_dashboard.test.test_data import utils


def data(TEST):
    # Data returned by openstack_dashboard.api.neutron wrapper.
    TEST.networks = utils.TestDataContainer()

    # Data return by neutronclient.
    TEST.api_networks = utils.TestDataContainer()
    TEST.api_subnets = utils.TestDataContainer()

    # 1st network.
    network_dict = {'admin_state_up': True,
                    'id': '82288d84-e0a5-42ac-95be-e6af08727e42',
                    'name': 'net1',
                    'status': 'ACTIVE',
                    'subnets': ['e8abc972-eb0c-41f1-9edd-4bc6e3bcd8c9',
                                '41e53a49-442b-4307-9e9a-88967a6b6657'],
                    'tenant_id': '1',
                    'router:external': False,
                    'shared': False}
    subnet_dict = {'allocation_pools': [{'end': '10.0.0.254',
                                         'start': '10.0.0.2'}],
                   'dns_nameservers': [],
                   'host_routes': [],
                   'cidr': '10.0.0.0/24',
                   'enable_dhcp': True,
                   'gateway_ip': '10.0.0.1',
                   'id': network_dict['subnets'][0],
                   'ip_version': 4,
                   'name': 'mysubnet1',
                   'network_id': network_dict['id'],
                   'tenant_id': network_dict['tenant_id']}
    subnetv6_dict = {
        'allocation_pools': [{'start': 'fdb6:b88a:488e::2',
                              'end': 'fdb6:b88a:488e:0:ffff:ffff:ffff:ffff'}],
        'dns_nameservers': [],
        'host_routes': [],
        'cidr': 'fdb6:b88a:488e::/64',
        'enable_dhcp': True,
        'gateway_ip': 'fdb6:b88a:488e::1',
        'id': network_dict['subnets'][1],
        'ip_version': 6,
        'name': 'myv6subnet',
        'network_id': network_dict['id'],
        'tenant_id': network_dict['tenant_id'],
        'ipv6_ra_mode': 'slaac',
        'ipv6_address_mode': 'slaac'
    }

    TEST.api_networks.add(network_dict)
    TEST.api_subnets.add(subnet_dict)
    TEST.api_subnets.add(subnetv6_dict)

    network = copy.deepcopy(network_dict)
    subnet = neutron.Subnet(subnet_dict)
    subnetv6 = neutron.Subnet(subnetv6_dict)
    network['subnets'] = [subnet, subnetv6]
    TEST.networks.add(neutron.Network(network))
