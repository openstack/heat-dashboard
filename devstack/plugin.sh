# plugin.sh - DevStack plugin.sh dispatch script heat-dashboard

HEAT_DASHBOARD_DIR=$(cd $(dirname $BASH_SOURCE)/.. && pwd)

function install_heat_dashboard {
    setup_develop ${HEAT_DASHBOARD_DIR}
}

function configure_heat_dashboard {
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/enabled/* ${DEST}/horizon/openstack_dashboard/local/enabled/
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/local_settings.d/_1699_orchestration_settings.py ${DEST}/horizon/openstack_dashboard/local/local_settings.d/
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/conf/heat_policy.yaml ${DEST}/horizon/openstack_dashboard/conf/
    cp -a ${HEAT_DASHBOARD_DIR}/heat_dashboard/conf/default_policies/heat.yaml ${DEST}/horizon/openstack_dashboard/conf/default_policies
    # NOTE: If locale directory does not exist, compilemessages will fail,
    # so check for an existence of locale directory is required.
    if [ -d ${HEAT_DASHBOARD_DIR}/heat_dashboard/locale ]; then
        (cd ${HEAT_DASHBOARD_DIR}/heat_dashboard; DJANGO_SETTINGS_MODULE=openstack_dashboard.settings $PYTHON ../manage.py compilemessages)
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
