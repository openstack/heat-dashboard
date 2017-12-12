# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.


from django.http import HttpResponse  # noqa
from django.utils.translation import ugettext_lazy as _
from django.views import generic

from horizon.browsers.views import AngularIndexView

from heat_dashboard.content.template_generator import api


class IndexView(AngularIndexView):
    template_name = 'project/template_generator/index.html'
    page_title = _("Template Generator")


class OptionView(generic.View):
    def get(self, request):
        return HttpResponse(api.get_resource_options(request),
                            content_type="application/json")
