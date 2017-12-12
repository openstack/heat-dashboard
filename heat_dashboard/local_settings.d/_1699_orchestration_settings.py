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

# This file is to be included for configuring application which relates
# to orchestration(Heat) functions.

from django.conf import settings


OPENSTACK_HEAT_STACK = {
    'enable_user_pass': True,
}

settings.POLICY_FILES.update({
    'orchestration': 'heat_policy.json',
})

# Sample
# settings.LOGGING['loggers'].update({
#     'heatclient': {
#         'handlers': ['console'],
#         'level': 'DEBUG',
#         'propagate': False,
#     }
# })

# Template Generator retrieve options API TIMEOUT
API_TIMEOUT = 60

# Template Generator retrieve options API PARALLEL LEVEL
API_PARALLEL = 2
