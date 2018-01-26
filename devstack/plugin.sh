# plugin.sh - DevStack plugin.sh dispatch script heat-dashboard

HEAT_DASHBOARD_DIR=$(cd $(dirname $BASH_SOURCE)/.. && pwd)

function install_heat_dashboard {
    # NOTE(shu-mutou): workaround for devstack bug: 1540328
    # where devstack install 'test-requirements' but should not do it
    # for heat-dashboard project as it installs Horizon from url.
    # Remove following two 'mv' commands when mentioned bug is fixed.
    mv $HEAT_DASHBOARD_DIR/test-requirements.txt $HEAT_DASHBOARD_DIR/_test-requirements.txt

    setup_develop ${HEAT_DASHBOARD_DIR}

    mv $HEAT_DASHBOARD_DIR/_test-requirements.txt $HEAT_DASHBOARD_DIR/test-requirements.txt
}

function configure_heat_dashboard {
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/enabled/* ${DEST}/horizon/openstack_dashboard/local/enabled/
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/local_settings.d/_1699_orchestration_settings.py ${DEST}/horizon/openstack_dashboard/local/local_settings.d/
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/conf/heat_policy.json ${DEST}/horizon/openstack_dashboard/conf/
    # NOTE: If locale directory does not exist, compilemessages will fail,
    # so check for an existence of locale directory is required.
    if [ -d ${HEAT_DASHBOARD_DIR}/heat_dashboard/locale ]; then
        (cd ${HEAT_DASHBOARD_DIR}/heat_dashboard; DJANGO_SETTINGS_MODULE=openstack_dashboard.settings ../manage.py compilemessages)
    fi
}

# check for service enabled
if is_service_enabled heat-dashboard; then

    if [[ "$1" == "stack" && "$2" == "pre-install"  ]]; then
        # Set up system services
        # no-op
        :

    elif [[ "$1" == "stack" && "$2" == "install"  ]]; then
        # Perform installation of service source
        echo_summary "Installing Heat Dashboard"
        install_heat_dashboard

    elif [[ "$1" == "stack" && "$2" == "post-config"  ]]; then
        # Configure after the other layer 1 and 2 services have been configured
        echo_summary "Configuring Heat Dashboard"
        configure_heat_dashboard

    elif [[ "$1" == "stack" && "$2" == "extra"  ]]; then
        # no-op
        :
    fi

    if [[ "$1" == "unstack"  ]]; then
        # no-op
        :
    fi

    if [[ "$1" == "clean"  ]]; then
        # Remove state and transient data
        # Remember clean.sh first calls unstack.sh
        # no-op
        :
    fi
fi
