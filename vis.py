import numpy as np
import math, json
from rdp import rdp
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation
from IPython.display import HTML
import tqdm.notebook as tq
import pickle
from collections import defaultdict
import cairosvg
from PIL import Image,ImageDraw
import glob
import os 
import re
import svgwrite
from chars import map_chars 

def get_bounds(data):
    minx, miny = 600, 600  
    maxx, maxy = 0, 0
    
    for i, (x, y, z) in enumerate(data): 
        if minx > x:
            minx = x
        if miny > y:
            miny = y 

        if maxx < x:
            maxx = x
        if maxy < y:
            maxy = y 
    return minx, maxx, miny, maxy

def convert_3d(drawing, return_flag = False, threshold=10):
    out = []
    corrupted = False
    for item in drawing:
        char = list(item.keys())[0]
        stroke = item[char]
        if len(stroke) == 1:
            x, y = stroke[0]
            out.append([x, y, 0])
            out.append([x+1, y+1, 1])
            continue
        segment = []
        for i, point in enumerate(stroke):
            x, y = point 
            if i == len(stroke) - 1:
                segment.append([x, y, 1])
            else:
                segment.append([x, y, 0])
        
        start = 0 
        for i, point in enumerate(segment):
            if i < len(segment) -1:
                x, y, _ = point
                next_x, next_y, _ = segment[i+1]
                if any((
                    abs(x-next_x)>threshold,
                    abs(y-next_y>threshold),
                )):
                    corrupted=True
                    start = i +1
        start = 0 
        out += segment[start:]
    if return_flag:
        return out, corrupted
    return out

def make_square(im, min_size=256, fill_color=(255, 255, 255)):
    x, y = im.size
    size = max(min_size, x, y)
    new_im = Image.new('RGBA', (size, size), fill_color)
    new_im.paste(im, (int((size - x) / 2), int((size - y) / 2)))
    return new_im

def draw_strokes(data, factor=1, svg_filename = 'tmp/sample.svg', stroke_width = 3, 
                square = False, return_res = False, crop = True):

    os.makedirs('tmp', exist_ok=True)
    if crop:
        min_x, max_x, min_y, max_y = get_bounds(data)
    else:
        min_x, max_x, min_y, max_y = 0, 600, 0, 600 

    dims = (50 + max_x - min_x, 50 + max_y - min_y)
    dwg = svgwrite.Drawing(svg_filename, size = dims)
    dwg.add(dwg.rect(insert=(0, 0), size=dims,fill='white'))
    lift_pen = 1
    abs_x = 25 - min_x 
    abs_y = 25 - min_y
    p = "M%s,%s " % (abs_x, abs_y)
    command = "M"
    for i in range(len(data)):
        if (lift_pen == 1):
            command = "M"
        elif (command != "L"):
            command = "L"
        else:
            command = ""
        x = float(data[i][0]) - min_x
        y = float(data[i][1]) - min_y
        lift_pen = data[i][2]
        p += command+str(x)+" "+str(y)+" "
    the_color = "black"
    
    dwg.add(dwg.path(p).stroke(the_color,stroke_width).fill("none"))
    dwg.save()
    cairosvg.svg2png(url="tmp/sample.svg", write_to="tmp/sample.png")
    img = Image.open('tmp/sample.png')
    if square:
        img = make_square(img)
    if return_res:
        return img, dims 
    else:
        return img

def apply_rdb(drawing, verbose = 0):
    new_drawing = []
    total_prev_strokes = 0
    total_post_strokes = 0
    for item in drawing:
        char = list(item.keys())[0]
        stroke = item[char]
        processed_stroke = []
        if len(stroke):
            if verbose:
                print('processing ', char)
            post_stroke = rdp(stroke, epsilon = 2.0)
            total_post_strokes += len(post_stroke)
            total_prev_strokes += len(stroke)
        new_drawing.append({char:post_stroke})
    if verbose:
        print('reduced from ', total_prev_strokes, ' to ', total_post_strokes)
    return new_drawing

def preprocess(text):
    char_comps = []
    
    diacritics = "[ًٌٍَُِّْ]"
    numbers = '0123456789'
    for diac in diacritics: 
        text = text.replace(diac, '')

    for num in numbers: 
        text = text.replace(num, '')
    
    outText = ""
    
    for i in range(len(text)):
    
        if (text[i] == " "):
            continue
    
        if text[i] in map_chars:
            if (i < len(text) - 1 and text[i] == "\u0643"):
                if text[i+1] != ' ':
                    char_comps.append({text[i] : '\uFEDB'})
                else:
                    char_comps.append({text[i] : map_chars[text[i]]})
            else:
                char_comps.append({text[i] : map_chars[text[i]]})
        else:
                char_comps.append({text[i] : text[i]})

    return char_comps

def concatenate(images, mode='h', margin=10):
    widths, heights = zip(*(i.size for i in images))
    if mode =='h':
        total_width = sum(widths)
        max_height = max(heights)

        new_im = Image.new('RGB', (total_width, max_height), (255, 255, 255))

        x_offset = 0
        for im in images[::-1]:
            new_im.paste(im, (x_offset,0))
            x_offset += im.size[0]
    elif mode == 'v':    
        total_height = sum(heights)
        max_width = max(widths)

        new_im = Image.new('RGB', (max_width, total_height+margin*(len(images)-1)), (255, 255, 255))
        draw = ImageDraw.Draw(new_im)
        y_offset = 0
        for im in images:
            new_im.paste(im, (0,y_offset+margin))
            y_offset += im.size[1]
            draw.line((0,y_offset+margin-5, max_width,y_offset+margin-5), fill=(0, 0, 0), width=3)
    return new_im

def generate_characters(file):
    char_drawings = []
    annot = file.split('/')[-1][:-5]
    char_comps = preprocess(annot)
    drawing = json.load(open(file))
    new_drawing = apply_rdb(drawing, verbose = 0)
    i = 0 
    for comp in char_comps:
        char = list(comp.keys())[0]
        j = i + len(comp[char])
        char_drawings.append({char:new_drawing[i:j]})
        i = j 
    return char_drawings

def generate_words(file):
    word_drawings = []
    annot = file.split('/')[-1][:-5]
    annot = re.sub('[0-9]', '', annot)
    char_comps = preprocess(annot)
    indices = [m.start() - i - 1 for i, m in enumerate(re.finditer(' ', annot))]
    indices = indices + [len(annot) - len(indices)- 1]
    drawing = json.load(open(file))
#     new_drawing = apply_rdb(drawing, verbose = 0)
    i, j  = 0, 0
    c = 0
    word = ""
    for cntr, comp in enumerate(char_comps):
        char = list(comp.keys())[0]
        j += len(comp[char])
        word += char
        if cntr == indices[c]:
            word_drawings.append({word:drawing[i:i+j]})
            i = i+j
            j = 0 
            c += 1
            word = ""
    return word_drawings

def get_annotation(json_path):
    return json_path.split('_')[0].split('/')[-1]

def clean_text(text):
    char_comps = []
    
    diacritics = "[ًٌٍَُِّْ]"

    text = re.sub("[ًٌٍَُِّْ]", "", text)
    text = re.sub('[0-9]', '', text)
    text = re.sub('[a-zA-Zö\xa0]', '', text)
    return text.replace('_', '')

def concatenate(images, mode='h', margin=10):
    widths, heights = zip(*(i.size for i in images))
    if mode =='h':
        total_width = sum(widths)
        max_height = max(heights)

        new_im = Image.new('RGB', (total_width, max_height), (255, 255, 255))

        x_offset = 0
        for im in images[::-1]:
            new_im.paste(im, (x_offset,0))
            x_offset += im.size[0]
    elif mode == 'v':    
        total_height = sum(heights)
        max_width = max(widths)

        new_im = Image.new('RGB', (max_width, total_height+margin*(len(images)-1)), (255, 255, 255))
        draw = ImageDraw.Draw(new_im)
        y_offset = 0
        for im in images:
            new_im.paste(im, (0,y_offset+margin))
            y_offset += im.size[1]
            draw.line((0,y_offset+margin-5, max_width,y_offset+margin-5), fill=(0, 0, 0), width=3)
    return new_im

def save_video(drawing, mx):
    num_sketches = 1
    global line_data, line
    line_data = ([], [])
    sqrt = int(math.sqrt(num_sketches))
    fig, ax = plt.subplots(sqrt, sqrt, figsize=(5,5))
    ax.set_ylim(600, 0)
    ax.set_xlim(0, 600)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_aspect('equal', adjustable='box')
    line, = ax.plot([], [], lw=2, color = 'k')

    def data_gen():
        for point in drawing:
            yield point


    # initialize the data arrays 
    def run(point):
        global line_data, line
        x, y, z = point
        line_data[0].append(x)
        line_data[1].append(y)
        line.set_data(line_data[0], line_data[1])
        if z == 1:
            line, = ax.plot([], [], lw=2, color = 'k')
            line_data = ([], [])

        return line

    ani = animation.FuncAnimation(fig, run, data_gen, interval=10, repeat=False, save_count=mx)
    d = ani.save(f'tmp/video.mp4', extra_args=['-vcodec', 'libx264'])

def create_animation(json_path):
    max_count = 1000  
    min_count = 100
    
    drawing = convert_3d(json.load(open(json_path)))
    save_video(drawing, len(drawing))
    return 'tmp/video.mp4'