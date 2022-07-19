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

    def save_image(self, data, save_path):
        b = data.encode()
        z = b[b.find(b'/9'):]
        Image.open(io.BytesIO(base64.b64decode(z))).save(save_path)
           
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        file_name = data['newImageName'].split('.')[0]
        existOnServer = bool(data['existOnServer'])
        ctr = '' 
        while True:
            if ctr+file_name+'.jpg' not in os.listdir('server/static/processed_images'):
                if existOnServer:
                    shutil.move(f"server/static/images/{data['oldImageName']}",
                                f"server/static/processed_images/{ctr+file_name}.jpg")
                else:
                    self.save_image(data['imageBlob'], f"server/static/processed_images/{ctr+file_name}.jpg")
                break 
            else:
                if ctr == '':
                    ctr = '1'
                else:
                    ctr = str(int(ctr)+1)
        
        file_path = f"server/static/data/{ctr+file_name}.json"
        json.dump(data['sketch'],open(file_path, 'w'))
        result = JsonResponse({'result':True})
        return result

class NextImageView(View):
    
    def get_next_image_name(self, curr_id):
        image_paths = os.listdir('server/static/images/')
        processed_image_paths = os.listdir('server/static/processed_images/')

        if curr_id >= len(image_paths):
            curr_id = 0
        elif curr_id == -1:
            curr_id = len(image_paths) - 1
        
        print('image path ', image_paths[curr_id])
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
        json_paths = os.listdir('server/static/data/')

        if curr_id >= len(json_paths):
            curr_id = 0
        elif curr_id == -1:
            curr_id = len(json_paths) - 1

        return JsonResponse({'json_path':json_paths[curr_id], 'id':curr_id})


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_next_json_name(int(request.GET['id'])))


class ListJsonView(View):
    
    def get_json_list(self):
        json_paths = os.listdir('server/static/data/')
        json_names = [json_path.split('.')[0] for json_path in json_paths]
        return JsonResponse({'json_names':json_names, 'size':len(json_paths)})


    def get(self, request, *args, **kwargs):
        return HttpResponse(self.get_json_list())



