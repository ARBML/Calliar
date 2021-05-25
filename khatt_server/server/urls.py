from .views import EndpointView, NextImageView, Endpoint2View
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'server'

urlpatterns = [
    path('', Endpoint2View.as_view(),name="home"),
    path('endpoint/', EndpointView.as_view(),name="endpoint"),
    path('endpoint2/', Endpoint2View.as_view(),name="endpoint2"),
    path('endpoint/next-image/', NextImageView.as_view(),name="next_image"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)