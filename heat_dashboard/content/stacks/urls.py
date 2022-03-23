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

from django.urls import re_path

from heat_dashboard.content.stacks import views

urlpatterns = [
    re_path(r'^$', views.IndexView.as_view(), name='index'),
    re_path(r'^select_template$',
            views.SelectTemplateView.as_view(),
            name='select_template'),
    re_path(r'^launch$', views.CreateStackView.as_view(), name='launch'),
    re_path(r'^preview_template$',
            views.PreviewTemplateView.as_view(), name='preview_template'),
    re_path(r'^preview$', views.PreviewStackView.as_view(), name='preview'),
    re_path(r'^preview_details$',
            views.PreviewStackDetailsView.as_view(), name='preview_details'),
    re_path(r'^stack/(?P<stack_id>[^/]+)/$',
            views.DetailView.as_view(), name='detail'),
    re_path(r'^(?P<stack_id>[^/]+)/change_template$',
            views.ChangeTemplateView.as_view(), name='change_template'),
    re_path(r'^(?P<stack_id>[^/]+)/edit_stack$',
            views.EditStackView.as_view(), name='edit_stack'),
    re_path(r'^stack/(?P<stack_id>[^/]+)/(?P<resource_name>[^/]+)/$',
            views.ResourceView.as_view(), name='resource'),
    re_path(r'^get_d3_data/(?P<stack_id>[^/]+)/$',
            views.JSONView.as_view(), name='d3_data'),
]
