from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/employees/', include('employees.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/reservations/', include('reservations.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/reports/', include('reports.urls')),
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]
