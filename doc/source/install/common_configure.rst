2. Edit the ``/etc/../horizon/../horizon.conf`` file and complete the following
   actions:

   * In the ``[database]`` section, configure database access:

     .. code-block:: ini

        [database]
        ...
        connection = mysql+pymysql://../horizon:../HORIZON_DBPASS@controller/../horizon
