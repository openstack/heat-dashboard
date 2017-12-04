=============
Configuration
=============

Heat Dashboard has configuration option as below.

For more configurations, see
`Configuration Guide <https://docs.openstack.org/horizon/latest/configuration/index.html>`_
in the Horizon documentation.

OPENSTACK_HEAT_STACK
~~~~~~~~~~~~~~~~~~~~

.. versionadded:: 9.0.0(Mitaka)

Default:

.. code-block:: python

    {
        'enable_user_pass': True
    }

A dictionary of settings to use with heat stacks. Currently, the only setting
available is "enable_user_pass", which can be used to disable the password
field while launching the stack. Currently HEAT API needs user password to
perform all the heat operations because in HEAT API trusts is not enabled by
default. So, this setting can be set as "False" in-case HEAT uses trusts by
default otherwise it needs to be set as "True".
