=================================
Heat Dashboard installation guide
=================================

This page describes the manual installation of heat-dashboard,
while distribution packages may provide more automated process.

.. note::

   This page assumes horizon has been installed.
   Horizon setup is beyond the scope of this page.

Install Heat Dashboard with all relevant packages to your Horizon environment.

.. code-block:: console

    pip install heat-dashboard

In most cases, heat-dashboard is installed into your python "site-packages"
directory like ``/usr/local/lib/python2.7/site-packages``.
We refer to the directory of heat-dashboard as ``<heat-dashboard-dir>`` below
and it would be ``<site-packages>/heat_dashboard`` if installed via pip.
The path varies depending on Linux distribution you use.

To enable heat-dashboard plugin, you need to put horizon plugin setup files
into horizon "enabled" directory.

The plugin setup files are found in ``<heat-dashboard-dir>/enabled``.

.. code-block:: console

   $ cp <heat-dashboard-dir>/enabled/_[1-9]*.py \
         /usr/share/openstack-dashboard/openstack_dashboard/local/enabled

.. note::

   The directory ``local/enabled`` may be different depending on your
   environment or distribution used. The path above is one used in Ubuntu
   horizon package.

Configure the policy file for heat-dashboard in OpenStack Dashboard
``local_settings.py``.

.. code-block:: python

   POLICY_FILES['orchestration'] = '<heat-dashboard-dir>/conf/heat_policy.json'

.. note::

   If your ``local_settings.py``  has no ``POLICY_FILES`` yet,
   you need to define the default ``POLICY_FILES`` in
   ``local_settings.py``. If you use the example ``local_settings.py`` file
   from horizon, what you need is to uncomment ``POLICY_FILES`` (which contains
   the default values).

You can also add additional configurations to ``local_settings.py``.
For more detail, see :doc:`/configuration/configuration`.
You can also find an example file at
``<heat-dashboard-dir>/heat_dashboard/local_settings.d``.

Compile the translation message catalogs of heat-dashboard.

.. code-block:: console

   $ cd <heat-dashboard-dir>
   $ python ./manage.py compilemessages

Run the Django update commands.
Note that ``compress`` is required when you enable compression.

.. code-block:: console

   $ cd <horizon-dir>
   $ DJANGO_SETTINGS_MODULE=openstack_dashboard.settings python manage.py collectstatic --noinput
   $ DJANGO_SETTINGS_MODULE=openstack_dashboard.settings python manage.py compress --force

Finally, restart your web server. For example, in case of apache:

.. code-block:: console

   $ sudo service apache2 restart
