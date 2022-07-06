from .views import EndpointView, NextImageView, Endpoint2View, NextImage2View
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'server'

urlpatterns = [
    path('', EndpointView.as_view(),name="home"),
    path('endpoint/', EndpointView.as_view(),name="endpoint"),
    path('endpoint2/', Endpoint2View.as_view(),name="endpoint2"),
    path('endpoint/next-image/', NextImageView.as_view(),name="next_image"),
    path('endpoint2/next-image2/', NextImage2View.as_view(),name="next_image2"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)