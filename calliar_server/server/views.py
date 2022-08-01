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
from django.conf import settings
import re 
import base64
import io
from PIL import Image

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
        data = json.loads(request.body)
        file_name = data['newImageName'].split('.')[0]
        exist_on_Server = bool(data['existOnServer'])
        new_file_name = ""
        counter = '' 
        while True:
            new_file_name = counter+file_name
            if new_file_name not in os.listdir(f"{settings.IMAGES_DIR}/processed_images"):
                if exist_on_Server:
                    shutil.move(f"{settings.IMAGES_DIR}/images/{data['oldImageName']}",
                                f"{settings.IMAGES_DIR}/processed_images/{new_file_name}.jpg")
                else:
                    image_bin = data['imageBlob'].encode()
                    save_path = f"{settings.IMAGES_DIR}/processed_images/{new_file_name}.jpg"
                    image_object = Image.open(io.BytesIO(base64.b64decode(image_bin[image_bin.find(b'/9'):])))
                    image_object.save(save_path)
                break 
            else:
                if counter == '':
                    counter = '1'
                else:
                    counter = str(int(counter)+1)

        file_path = f"{settings.IMAGES_DIR}/annotations/{new_file_name}.json"
        json.dump(data['sketch'],open(file_path, 'w'))
        result = JsonResponse({'result':True})
        return result

class NextImageView(View):
    
    def get_next_image_name(self, curr_id):
        image_paths = os.listdir(f'{settings.IMAGES_DIR}/images/')
        processed_image_paths = os.listdir(f'{settings.IMAGES_DIR}/processed_images/')
        
        if not any ([
                os.path.isfile(f'{settings.IMAGES_DIR}/images/{file}') 
                for file in os.listdir(f'{settings.IMAGES_DIR}/images/')
            ]):
            return JsonResponse({'result':False,'description':'No more images to return'},status=404)
                

        if curr_id >= len(image_paths):
            curr_id = 0
        elif curr_id == -1:
            curr_id = len(image_paths) - 1
        

        return JsonResponse({'image_path':image_paths[curr_id], 'num_images':len(image_paths),
            'proc_num_images':len(processed_image_paths), 'id':curr_id})


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_next_image_name(int(request.GET['id'])))

class ExploreView(View):
    
    template_name = 'server/explore.html'
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
        
class NextJsonView(View):
    
    def get_next_json_name(self, curr_id):
        json_paths = os.listdir(f'{settings.IMAGES_DIR}/annotations/')

        if curr_id >= len(json_paths):
            curr_id = 0
        elif curr_id == -1:
            curr_id = len(json_paths) - 1

        return JsonResponse({'json_path':json_paths[curr_id], 'id':curr_id})


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_next_json_name(int(request.GET['id'])))


class ListJsonView(View):
    
    def get_json_list(self):
        json_paths = os.listdir(f'{settings.IMAGES_DIR}/annotations/')
        json_names = [json_path.split('.')[0] for json_path in json_paths]
        return JsonResponse({'json_names':json_names, 'size':len(json_paths)})


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_json_list())



