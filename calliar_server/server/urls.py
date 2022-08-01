from .views import EndpointView, NextImageView, ExploreView, NextJsonView, ListJsonView
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'server'

urlpatterns = [
    path('', EndpointView.as_view(),name="home"),
    path('endpoint/', EndpointView.as_view(),name="endpoint"),
    path('endpoint/next-image/', NextImageView.as_view(),name="next_image"),
    path('explore/', ExploreView.as_view()),
    path('explore/next-json/', NextJsonView.as_view(),name="next_image"),
    path('explore/list-json/', ListJsonView.as_view(),name="list_jsons"),
]