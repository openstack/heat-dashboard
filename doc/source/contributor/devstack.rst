==============================
Use Heat Dashboard in DevStack
==============================

Set up your ``local.conf`` to enable heat-dashboard::

    [[local|localrc]]
    enable_plugin heat-dashboard https://opendev.org/openstack/heat-dashboard


.. note::

    You also need to install Heat itself into DevStack to use Heat Dashboard.
