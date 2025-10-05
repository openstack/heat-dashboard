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

import json

from novaclient.v2 import availability_zones
from novaclient.v2 import flavors
from novaclient.v2 import keypairs
from novaclient.v2 import servers

from heat_dashboard.test.test_data import utils


class FlavorExtraSpecs(dict):
    def __repr__(self):
        return "<FlavorExtraSpecs %s>" % self._info

    def __init__(self, info):
        super().__init__()
        self.__dict__.update(info)
        self.update(info)
        self._info = info


SERVER_DATA = """
{
    "server": {
        "OS-EXT-SRV-ATTR:instance_name": "instance-00000005",
        "OS-EXT-SRV-ATTR:host": "instance-host",
        "OS-EXT-STS:task_state": null,
        "addresses": {
            "private": [
                {
                    "version": 4,
                    "addr": "10.0.0.1"
                }
            ]
        },
        "links": [
            {
                "href": "%(host)s/v1.1/%(tenant_id)s/servers/%(server_id)s",
                "rel": "self"
            },
            {
                "href": "%(host)s/%(tenant_id)s/servers/%(server_id)s",
                "rel": "bookmark"
            }
        ],
        "image": {
            "id": "%(image_id)s",
            "links": [
                {
                    "href": "%(host)s/%(tenant_id)s/images/%(image_id)s",
                    "rel": "bookmark"
                }
            ]
        },
        "OS-EXT-STS:vm_state": "active",
        "flavor": {
            "id": "%(flavor_id)s",
            "links": [
                {
                    "href": "%(host)s/%(tenant_id)s/flavors/%(flavor_id)s",
                    "rel": "bookmark"
                }
            ]
        },
        "id": "%(server_id)s",
        "user_id": "%(user_id)s",
        "OS-DCF:diskConfig": "MANUAL",
        "accessIPv4": "",
        "accessIPv6": "",
        "progress": null,
        "OS-EXT-STS:power_state": 1,
        "config_drive": "",
        "status": "%(status)s",
        "updated": "2012-02-28T19:51:27Z",
        "hostId": "c461ea283faa0ab5d777073c93b126c68139e4e45934d4fc37e403c2",
        "key_name": "%(key_name)s",
        "name": "%(name)s",
        "created": "2012-02-28T19:51:17Z",
        "tenant_id": "%(tenant_id)s",
        "metadata": {"someMetaLabel": "someMetaData",
                     "some<b>html</b>label": "<!--",
                     "empty": ""}
    }
}
"""


def data(TEST):
    TEST.servers = utils.TestDataContainer()
    TEST.flavors = utils.TestDataContainer()
    TEST.keypairs = utils.TestDataContainer()
    TEST.availability_zones = utils.TestDataContainer()

    # Flavors
    flavor_1 = flavors.Flavor(flavors.FlavorManager(None),
                              {'id': "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                               'name': 'm1.tiny',
                               'vcpus': 1,
                               'disk': 0,
                               'ram': 512,
                               'swap': 0,
                               'rxtx_factor': 1,
                               'extra_specs': {},
                               'os-flavor-access:is_public': True,
                               'OS-FLV-EXT-DATA:ephemeral': 0})
    flavor_2 = flavors.Flavor(flavors.FlavorManager(None),
                              {'id': "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                               'name': 'm1.massive',
                               'vcpus': 1000,
                               'disk': 1024,
                               'ram': 10000,
                               'swap': 0,
                               'rxtx_factor': 1,
                               'extra_specs': {'Trusted': True, 'foo': 'bar'},
                               'os-flavor-access:is_public': True,
                               'OS-FLV-EXT-DATA:ephemeral': 2048})
    flavor_3 = flavors.Flavor(flavors.FlavorManager(None),
                              {'id': "dddddddd-dddd-dddd-dddd-dddddddddddd",
                               'name': 'm1.secret',
                               'vcpus': 1000,
                               'disk': 1024,
                               'ram': 10000,
                               'swap': 0,
                               'rxtx_factor': 1,
                               'extra_specs': {},
                               'os-flavor-access:is_public': False,
                               'OS-FLV-EXT-DATA:ephemeral': 2048})
    flavor_4 = flavors.Flavor(flavors.FlavorManager(None),
                              {'id': "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
                               'name': 'm1.metadata',
                               'vcpus': 1000,
                               'disk': 1024,
                               'ram': 10000,
                               'swap': 0,
                               'rxtx_factor': 1,
                               'extra_specs': FlavorExtraSpecs(
                                   {'key': 'key_mock',
                                    'value': 'value_mock'}),
                               'os-flavor-access:is_public': False,
                               'OS-FLV-EXT-DATA:ephemeral': 2048})
    TEST.flavors.add(flavor_1, flavor_2, flavor_3, flavor_4)

    # Key pairs
    keypair = keypairs.Keypair(keypairs.KeypairManager(None),
                               dict(name='keyName'))
    TEST.keypairs.add(keypair)

    # Servers
    vals = {"host": "http://nova.example.com:8774",
            "name": "server_1",
            "status": "ACTIVE",
            "tenant_id": TEST.tenants.first().id,
            "user_id": TEST.user.id,
            "server_id": "1",
            "flavor_id": flavor_1.id,
            "image_id": TEST.images.first().id,
            "key_name": keypair.name}
    server_1 = servers.Server(servers.ServerManager(None),
                              json.loads(SERVER_DATA % vals)['server'])
    vals.update({"name": "server_2",
                 "status": "BUILD",
                 "server_id": "2"})
    server_2 = servers.Server(servers.ServerManager(None),
                              json.loads(SERVER_DATA % vals)['server'])
    vals.update({"name": "server_4",
                 "status": "PAUSED",
                 "server_id": "4"})
    server_4 = servers.Server(servers.ServerManager(None),
                              json.loads(SERVER_DATA % vals)['server'])
    TEST.servers.add(server_1, server_2, server_4)

    # Availability Zones
    TEST.availability_zones.add(availability_zones.AvailabilityZone(
        availability_zones.AvailabilityZoneManager(None),
        {
            'zoneName': 'nova',
            'zoneState': {'available': True},
            'hosts': {
                "host001": {
                    "nova-network": {
                        "active": True,
                        "available": True,
                    },
                },
            },
        },
    ))
