from .views import EndpointView, NextImageView
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'server'

urlpatterns = [
    path('endpoint/', EndpointView.as_view(),name="endpoint"),
    path('endpoint/next-image/', NextImageView.as_view(),name="next_image"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)