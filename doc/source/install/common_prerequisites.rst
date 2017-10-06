Prerequisites
-------------

Before you install and configure the openstack service,
you must create a database, service credentials, and API endpoints.

#. To create the database, complete these steps:

   * Use the database access client to connect to the database
     server as the ``root`` user:

     .. code-block:: console

        $ mysql -u root -p

   * Create the ``../horizon`` database:

     .. code-block:: none

        CREATE DATABASE ../horizon;

   * Grant proper access to the ``../horizon`` database:

     .. code-block:: none

        GRANT ALL PRIVILEGES ON ../horizon.* TO '../horizon'@'localhost' \
          IDENTIFIED BY '../HORIZON_DBPASS';
        GRANT ALL PRIVILEGES ON ../horizon.* TO '../horizon'@'%' \
          IDENTIFIED BY '../HORIZON_DBPASS';

     Replace ``../HORIZON_DBPASS`` with a suitable password.

   * Exit the database access client.

     .. code-block:: none

        exit;

#. Source the ``admin`` credentials to gain access to
   admin-only CLI commands:

   .. code-block:: console

      $ . admin-openrc

#. To create the service credentials, complete these steps:

   * Create the ``../horizon`` user:

     .. code-block:: console

        $ openstack user create --domain default --password-prompt ../horizon

   * Add the ``admin`` role to the ``../horizon`` user:

     .. code-block:: console

        $ openstack role add --project service --user ../horizon admin

   * Create the ../horizon service entities:

     .. code-block:: console

        $ openstack service create --name ../horizon --description "openstack" openstack

#. Create the openstack service API endpoints:

   .. code-block:: console

      $ openstack endpoint create --region RegionOne \
        openstack public http://controller:XXXX/vY/%\(tenant_id\)s
      $ openstack endpoint create --region RegionOne \
        openstack internal http://controller:XXXX/vY/%\(tenant_id\)s
      $ openstack endpoint create --region RegionOne \
        openstack admin http://controller:XXXX/vY/%\(tenant_id\)s
