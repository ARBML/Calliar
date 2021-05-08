from django.shortcuts import render
from django.views.generic import View
# Create your views here.
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import numpy as np
import os

@method_decorator(csrf_exempt, name='dispatch')
class EndpointView(View):

    template_name = 'server/index.html'


    def render_to_template(self):
        # context = {'next_image_name':self.get_next_image_name()}
        context = {}
        print(context)
        context = {}
        return render(
            self.request,
            self.template_name,
            context,
        )
    
    def get(self, request, *args, **kwargs):
        return self.render_to_template()

    def post(self, request, *args, **kwargs):
        data = eval(request.body)
        np.save(f"server/data/{data['imageName'].split('.')[0]}.npy",np.array(data['value']))
        return HttpResponse(f"Hello, data recieved successfully. Data:{data['value']}")


class NextImageView(View):

    def get_next_image_name(self):
        uploaded_images_paths = os.listdir('server/data')
        uploaded_images_names = [image_path.split('.')[0] for image_path in uploaded_images_paths]
        for image_path in os.listdir('server/static/images/'):
            image_name = image_path.split('.')[0]
            if image_name not in uploaded_images_names:
                return image_path
        return None


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_next_image_name())

