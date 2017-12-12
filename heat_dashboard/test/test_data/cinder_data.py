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

from cinderclient.v2 import volume_backups as vol_backups
from cinderclient.v2 import volume_snapshots as vol_snaps
from cinderclient.v2 import volume_types
from cinderclient.v2 import volumes

from openstack_dashboard import api

from openstack_dashboard.test.test_data import utils


def data(TEST):
    TEST.cinder_volumes = utils.TestDataContainer()
    TEST.cinder_volume_backups = utils.TestDataContainer()
    TEST.cinder_volume_types = utils.TestDataContainer()
    TEST.cinder_volume_snapshots = utils.TestDataContainer()

    # Volumes - Cinder v1
    volume = volumes.Volume(
        volumes.VolumeManager(None),
        {'id': "11023e92-8008-4c8b-8059-7f2293ff3887",
         'status': 'available',
         'size': 40,
         'display_name': 'Volume name',
         'display_description': 'Volume description',
         'created_at': '2014-01-27 10:30:00',
         'volume_type': None,
         'attachments': []})
    nameless_volume = volumes.Volume(
        volumes.VolumeManager(None),
        {"id": "4b069dd0-6eaa-4272-8abc-5448a68f1cce",
         "status": 'available',
         "size": 10,
         "display_name": '',
         "display_description": '',
         "device": "/dev/hda",
         "created_at": '2010-11-21 18:34:25',
         "volume_type": 'vol_type_1',
         "attachments": []})
    other_volume = volumes.Volume(
        volumes.VolumeManager(None),
        {'id': "21023e92-8008-1234-8059-7f2293ff3889",
         'status': 'in-use',
         'size': 10,
         'display_name': u'my_volume',
         'display_description': '',
         'created_at': '2013-04-01 10:30:00',
         'volume_type': None,
         'attachments': [{"id": "1", "server_id": '1',
                          "device": "/dev/hda"}]})
    volume_with_type = volumes.Volume(
        volumes.VolumeManager(None),
        {'id': "7dcb47fd-07d9-42c2-9647-be5eab799ebe",
         'name': 'my_volume2',
         'status': 'in-use',
         'size': 10,
         'display_name': u'my_volume2',
         'display_description': '',
         'created_at': '2013-04-01 10:30:00',
         'volume_type': 'vol_type_2',
         'attachments': [{"id": "2", "server_id": '2',
                          "device": "/dev/hdb"}]})
    non_bootable_volume = volumes.Volume(
        volumes.VolumeManager(None),
        {'id': "21023e92-8008-1234-8059-7f2293ff3890",
         'status': 'in-use',
         'size': 10,
         'display_name': u'my_volume',
         'display_description': '',
         'created_at': '2013-04-01 10:30:00',
         'volume_type': None,
         'bootable': False,
         'attachments': [{"id": "1", "server_id": '1',
                          "device": "/dev/hda"}]})

    volume.bootable = 'true'
    nameless_volume.bootable = 'true'
    other_volume.bootable = 'true'

    TEST.cinder_volumes.add(api.cinder.Volume(volume))
    TEST.cinder_volumes.add(api.cinder.Volume(nameless_volume))
    TEST.cinder_volumes.add(api.cinder.Volume(other_volume))
    TEST.cinder_volumes.add(api.cinder.Volume(volume_with_type))
    TEST.cinder_volumes.add(api.cinder.Volume(non_bootable_volume))

    vol_type1 = volume_types.VolumeType(volume_types.VolumeTypeManager(None),
                                        {'id': u'1',
                                         'name': u'vol_type_1',
                                         'description': 'type 1 description',
                                         'extra_specs': {'foo': 'bar',
                                                         'volume_backend_name':
                                                         'backend_1'}})
    vol_type2 = volume_types.VolumeType(volume_types.VolumeTypeManager(None),
                                        {'id': u'2',
                                         'name': u'vol_type_2',
                                         'description': 'type 2 description'})
    vol_type3 = volume_types.VolumeType(volume_types.VolumeTypeManager(None),
                                        {'id': u'3',
                                         'name': u'vol_type_3',
                                         'is_public': False,
                                         'description': 'type 3 description'})
    TEST.cinder_volume_types.add(vol_type1, vol_type2, vol_type3)

    # Volumes - Cinder v2
    volume_v2 = volumes.Volume(
        volumes.VolumeManager(None),
        {'id': "31023e92-8008-4c8b-8059-7f2293ff1234",
         'name': 'v2_volume',
         'description': "v2 Volume Description",
         'status': 'available',
         'size': 20,
         'created_at': '2014-01-27 10:30:00',
         'volume_type': None,
         'os-vol-host-attr:host': 'host@backend-name#pool',
         'bootable': 'true',
         'attachments': []})
    volume_v2.bootable = 'true'

    TEST.cinder_volumes.add(api.cinder.Volume(volume_v2))

    snapshot = vol_snaps.Snapshot(
        vol_snaps.SnapshotManager(None),
        {'id': '5f3d1c33-7d00-4511-99df-a2def31f3b5d',
         'display_name': 'test snapshot',
         'display_description': 'volume snapshot',
         'size': 40,
         'status': 'available',
         'volume_id': '11023e92-8008-4c8b-8059-7f2293ff3887'})
    snapshot2 = vol_snaps.Snapshot(
        vol_snaps.SnapshotManager(None),
        {'id': 'c9d0881a-4c0b-4158-a212-ad27e11c2b0f',
         'name': '',
         'description': 'v2 volume snapshot description',
         'size': 80,
         'status': 'available',
         'volume_id': '31023e92-8008-4c8b-8059-7f2293ff1234'})
    snapshot3 = vol_snaps.Snapshot(
        vol_snaps.SnapshotManager(None),
        {'id': 'c9d0881a-4c0b-4158-a212-ad27e11c2b0e',
         'name': '',
         'description': 'v2 volume snapshot description 2',
         'size': 80,
         'status': 'available',
         'volume_id': '31023e92-8008-4c8b-8059-7f2293ff1234'})
    snapshot4 = vol_snaps.Snapshot(
        vol_snaps.SnapshotManager(None),
        {'id': 'cd6be1eb-82ca-4587-8036-13c37c00c2b1',
         'name': '',
         'description': 'v2 volume snapshot with metadata description',
         'size': 80,
         'status': 'available',
         'volume_id': '31023e92-8008-4c8b-8059-7f2293ff1234',
         'metadata': {'snapshot_meta_key': 'snapshot_meta_value'}})

    snapshot.bootable = 'true'
    snapshot2.bootable = 'true'

    TEST.cinder_volume_snapshots.add(api.cinder.VolumeSnapshot(snapshot))
    TEST.cinder_volume_snapshots.add(api.cinder.VolumeSnapshot(snapshot2))
    TEST.cinder_volume_snapshots.add(api.cinder.VolumeSnapshot(snapshot3))
    TEST.cinder_volume_snapshots.add(api.cinder.VolumeSnapshot(snapshot4))
    TEST.cinder_volume_snapshots.first()._volume = volume

    volume_backup1 = vol_backups.VolumeBackup(
        vol_backups.VolumeBackupManager(None),
        {'id': 'a374cbb8-3f99-4c3f-a2ef-3edbec842e31',
         'name': 'backup1',
         'description': 'volume backup 1',
         'size': 10,
         'status': 'available',
         'container_name': 'volumebackups',
         'volume_id': '11023e92-8008-4c8b-8059-7f2293ff3887'})

    volume_backup2 = vol_backups.VolumeBackup(
        vol_backups.VolumeBackupManager(None),
        {'id': 'c321cbb8-3f99-4c3f-a2ef-3edbec842e52',
         'name': 'backup2',
         'description': 'volume backup 2',
         'size': 20,
         'status': 'available',
         'container_name': 'volumebackups',
         'volume_id': '31023e92-8008-4c8b-8059-7f2293ff1234'})

    volume_backup3 = vol_backups.VolumeBackup(
        vol_backups.VolumeBackupManager(None),
        {'id': 'c321cbb8-3f99-4c3f-a2ef-3edbec842e53',
         'name': 'backup3',
         'description': 'volume backup 3',
         'size': 20,
         'status': 'available',
         'container_name': 'volumebackups',
         'volume_id': '31023e92-8008-4c8b-8059-7f2293ff1234'})

    TEST.cinder_volume_backups.add(volume_backup1)
    TEST.cinder_volume_backups.add(volume_backup2)
    TEST.cinder_volume_backups.add(volume_backup3)
