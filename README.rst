OpenStack Dashboard plugin for Heat project
===========================================

How to use with Horizon on server:
----------------------------------

| Use pip to install the package on the server running Horizon. 
| Then either copy or link the files in heat_dashboard/enabled to
| openstack_dashboard/local/enabled like following.


.. code-block:: bash

    cd heat-dashboard & python setup.py sdist
    horizon/tools/with_venv.sh pip install dist/package.tar.gz

    cp -rv enabled/ horizon/openstack_dashboard/local/
    # !! ADD_SCSS_FILES may be overried to your environment.

    # Restart Apache or your Django test server
    # You may need to run
    python manage.py collectstatic
    python manage.py compress

| This step will cause the Horizon service to pick up the heat plugin
| when it starts.


To run unit tests:
------------------
::

    ./run_tests.sh


Reference:
-----------------------------------------------------------------------------------
https://docs.openstack.org/horizon/latest/contributor/tutorials/plugin.html
