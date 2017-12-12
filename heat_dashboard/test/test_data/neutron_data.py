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
    TEST.subnets = utils.TestDataContainer()
    TEST.ports = utils.TestDataContainer()
    TEST.routers = utils.TestDataContainer()
    TEST.floating_ips = utils.TestDataContainer()
    TEST.security_groups = utils.TestDataContainer()
    TEST.qos_policies = utils.TestDataContainer()

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
    TEST.subnets.add(subnet)
    TEST.subnets.add(subnetv6)

    # Ports on 1st network.
    port_dict = {
        'admin_state_up': True,
        'device_id': 'af75c8e5-a1cc-4567-8d04-44fcd6922890',
        'device_owner': 'network:dhcp',
        'fixed_ips': [{'ip_address': '10.0.0.3',
                       'subnet_id': subnet_dict['id']}],
        'id': '063cf7f3-ded1-4297-bc4c-31eae876cc91',
        'mac_address': 'fa:16:3e:9c:d5:7e',
        'name': '',
        'network_id': network_dict['id'],
        'status': 'ACTIVE',
        'tenant_id': network_dict['tenant_id'],
        'binding:vnic_type': 'normal',
        'binding:host_id': 'host',
        'allowed_address_pairs': [
            {'ip_address': '174.0.0.201',
             'mac_address': 'fa:16:3e:7a:7b:18'}
        ],
        'port_security_enabled': True,
        'security_groups': [],
    }

    TEST.ports.add(neutron.Port(port_dict))

    # External network.
    network_dict = {'admin_state_up': True,
                    'id': '9b466b94-213a-4cda-badf-72c102a874da',
                    'name': 'ext_net',
                    'status': 'ACTIVE',
                    'subnets': ['d6bdc71c-7566-4d32-b3ff-36441ce746e8'],
                    'tenant_id': '3',
                    'router:external': True,
                    'shared': False}
    subnet_dict = {'allocation_pools': [{'start': '172.24.4.226.',
                                         'end': '172.24.4.238'}],
                   'dns_nameservers': [],
                   'host_routes': [],
                   'cidr': '172.24.4.0/28',
                   'enable_dhcp': False,
                   'gateway_ip': '172.24.4.225',
                   'id': 'd6bdc71c-7566-4d32-b3ff-36441ce746e8',
                   'ip_version': 4,
                   'name': 'ext_subnet',
                   'network_id': network_dict['id'],
                   'tenant_id': network_dict['tenant_id']}
    ext_net = network_dict
    network = copy.deepcopy(network_dict)
    subnet = neutron.Subnet(subnet_dict)
    network['subnets'] = [subnet]
    TEST.networks.add(neutron.Network(network))
    TEST.subnets.add(subnet)

    assoc_port = port_dict

    router_dict = {'id': '279989f7-54bb-41d9-ba42-0d61f12fda61',
                   'name': 'router1',
                   'status': 'ACTIVE',
                   'admin_state_up': True,
                   'distributed': True,
                   'external_gateway_info':
                       {'network_id': ext_net['id']},
                   'tenant_id': '1',
                   'availability_zone_hints': ['nova']}
    TEST.routers.add(neutron.Router(router_dict))

    # Associated (with compute port on 1st network).
    fip_dict = {'tenant_id': '1',
                'floating_ip_address': '172.16.88.228',
                'floating_network_id': ext_net['id'],
                'id': 'a97af8f2-3149-4b97-abbd-e49ad19510f7',
                'fixed_ip_address': assoc_port['fixed_ips'][0]['ip_address'],
                'port_id': assoc_port['id'],
                'router_id': router_dict['id']}
    fip_with_instance = copy.deepcopy(fip_dict)
    fip_with_instance.update({'instance_id': '1',
                              'instance_type': 'compute'})
    TEST.floating_ips.add(neutron.FloatingIp(fip_with_instance))

    # Security group.

    sec_group_1 = {'tenant_id': '1',
                   'description': 'default',
                   'id': 'faad7c80-3b62-4440-967c-13808c37131d',
                   'name': 'default'}
    sec_group_2 = {'tenant_id': '1',
                   'description': 'NotDefault',
                   'id': '27a5c9a1-bdbb-48ac-833a-2e4b5f54b31d',
                   'name': 'other_group'}
    sec_group_3 = {'tenant_id': '1',
                   'description': 'NotDefault',
                   'id': '443a4d7a-4bd2-4474-9a77-02b35c9f8c95',
                   'name': 'another_group'}
    groups = [sec_group_1, sec_group_2, sec_group_3]
    sg_name_dict = dict([(sg['id'], sg['name']) for sg in groups])
    for sg in groups:
        sg['security_group_rules'] = []
        # OpenStack Dashboard internaly API.
        TEST.security_groups.add(
            neutron.SecurityGroup(copy.deepcopy(sg), sg_name_dict))

    # qos policies
    policy_dict = {'id': 'a21dcd22-7189-cccc-aa32-22adafaf16a7',
                   'name': 'policy 1',
                   'tenant_id': '1'}
    TEST.qos_policies.add(neutron.QoSPolicy(policy_dict))
    policy_dict1 = {'id': 'a21dcd22-7189-ssss-aa32-22adafaf16a7',
                    'name': 'policy 2',
                    'tenant_id': '1'}
    TEST.qos_policies.add(neutron.QoSPolicy(policy_dict1))
