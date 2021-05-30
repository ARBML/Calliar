from django.shortcuts import render
from django.views.generic import View
# Create your views here.
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import numpy as np
import os
from random import shuffle
from django.http import JsonResponse
import json
import shutil

@method_decorator(csrf_exempt, name='dispatch')
class EndpointView(View):
    
    template_name = 'server/index.html'

    def render_to_template(self):
        # context = {'next_image_name':self.get_next_image_name()}
        context = {}
        return render(
            self.request,
            self.template_name,
            context,
        )
    
    def get(self, request, *args, **kwargs):
        return self.render_to_template()

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            file_name = data['sketchName'].split('.')[0]
            cnt = 0 
            while str(cnt)+file_name in os.listdir('server/larger_data/'):
                cnt += 1
                file_name = str(cnt)+file_name

            file_path = f"server/larger_data/{file_name}.json"
            json.dump(data['sketch'],open(file_path, 'w'))
            result = JsonResponse({'result':True})
        except Exception as e:
            print(e)
            result = JsonResponse({'result':False})
        return result

class NextImageView(View):

    def get_next_image_name(self):
        print('calling here')
        uploaded_images_paths = os.listdir('server/larger_data')
        uploaded_images_names = [image_path.split('.')[0] for image_path in uploaded_images_paths]
        image_paths = os.listdir('server/static/larger_images/')
        shuffle(image_paths)
        for image_path in image_paths:
            image_name = image_path.split('.')[0]
            if image_name not in uploaded_images_names:
                return image_path
        return None


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_next_image_name())

@method_decorator(csrf_exempt, name='dispatch')
class Endpoint2View(View):
    
    template_name = 'server/index2.html'

    def render_to_template(self):
        # context = {'next_image_name':self.get_next_image_name()}
        context = {}
        return render(
            self.request,
            self.template_name,
            context,
        )
    
    def get(self, request, *args, **kwargs):
        return self.render_to_template()

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            image_name = data["imageName"]
            text = data["text"]
            print(text)
            print(os.listdir('server/larger_data'))
            file_path = None
            counter = 1
            while True:
                if str(counter)+text+'.jpg' not in os.listdir('server/larger_data'):
                    if text+'.jpg' not in os.listdir('server/larger_data'):
                        file_path = f"server/larger_data/{text}"
                    else:
                        file_path = f"server/larger_data/{str(counter)+text}"
                    break
                counter += 1
            shutil.move(f'server/static/larger_images/{image_name}',f'{file_path}.jpg')
            result = JsonResponse({'result':True})
        except Exception as e:
                print(e)
                result = JsonResponse({'result':False})
        return result

