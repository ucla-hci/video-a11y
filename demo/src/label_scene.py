import csv
import os, json
import matplotlib.pyplot as plt
import argparse
from google.cloud import videointelligence
from google.cloud import vision
import io
from os import listdir
from os.path import isfile, join
from google.oauth2 import service_account
from ast import literal_eval
path = '/Users/mina/Desktop/hecate/output/'
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/mina/Desktop/VideoA11y-3de01f8ba626.json"
# change here to test with different videos
video_id = 'qPix_X-9t7E'

def detect_text(path):
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations
    if not texts:
        print("no text")
        return []
    text_list = []
    for text in texts:
        vertices = (['[{},{}]'.format(vertex.x, vertex.y)
                for vertex in text.bounding_poly.vertices])
        x = literal_eval(vertices[0])[0]
        y = literal_eval(vertices[0])[1]
        width = literal_eval(vertices[1])[0] - int(x)
        height = literal_eval(vertices[2])[1] - int(y)
        text_list.append({
            'text': text.description,
            'x': x, 
            'y': y,
            'width': width,
            'height': height
        })

    return text_list

def detect_labels(path):
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations
    
    label_list = []
    for label in labels:
        if(label.score > 0.8):
            label_list.append({
                'label': label.description
            })
    return label_list[:3]

            
def localize_objects(path):
    client = vision.ImageAnnotatorClient()

    with open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    objects = client.object_localization(
        image=image).localized_object_annotations

    
    object_list = []
    for object_ in objects:
        if object_.score > 0.5:
            vertices = (['[{},{}]'.format(vertex.x, vertex.y)
                    for vertex in object_.bounding_poly.normalized_vertices])
            x = literal_eval(vertices[0])[0]
            y = literal_eval(vertices[0])[1]
            width = literal_eval(vertices[1])[0] - int(x)
            height = literal_eval(vertices[2])[1] - int(y)
            object_list.append({
                'object': object_.name,
                'x': x, 
                'y': y,
                'width': width,
                'height': height
            })
    
        else:
            continue
    # print('\n{} (confidence: {})'.format(object_.name, object_.score))
    # print('Normalized bounding polygon vertices: ')
    # for vertex in object_.bounding_poly.normalized_vertices:
    #     print(' - ({}, {})'.format(vertex.x, vertex.y))
    return object_list
        


def label_scene(vidoe_id, scene_idx):
    keyframe_num = 0
    while(True):
        keyframe = path + video_id + '-0' + str(scene_idx) + '_0' + str(keyframe_num) + '.png'
        print(keyframe)
        if not isfile(keyframe):
            if keyframe_num >= 2:
                return ([], [], [])
            else:
                keyframe_num += 1
                continue
        frame_texts = detect_text(keyframe)
        frame_objs = localize_objects(keyframe)
        frame_labels = detect_labels(keyframe)
        if(not frame_texts and not frame_objs and not frame_labels):
            if keyframe_num >= 2:
                return ([], [], [])
            else:
                keyframe_num += 1
        else:
            print(frame_texts)
            print(frame_objs)
            print(frame_labels)
            return (frame_texts, frame_objs, frame_labels)

    json_file.close()

def get_pos_size(object):
    center_y = object['y'] + object['height']/2
    center_x = object['x'] + object['width']/2
    if center_y <= 0.3:
        position = 'bottom'
    elif center_y <= 0.7:
        position = 'middle'
    else:
        position = 'top'
    if center_x <= 0.3:
        position += ' left'
    elif center_x <= 0.7:
        if position == 'middle':
            position = 'center'
        else: 
            position += ' middle'
    else:
        position += ' right'

    if object['width'] <= 0.3:
        if object['height'] <= 0.3:
            size = 'small'
        elif object['height'] <= 0.7:
            size = 'medium'
        else:
            size = 'narrow and tall'
    elif object['width'] <= 0.7:
        if object['height'] <= 0.3:
            size = 'medium'
        elif object['height'] <= 0.7:
            size = 'medium'
        else:
            size = 'tall'
    else:
        if object['height'] <= 0.3:
            size = 'short and vertical long'
        elif object['height'] <= 0.7:
            size = 'wide'
        else:
            size = 'very large'
    
    return (position, size)
    


with open(video_id + '.json') as scenes_file:
    scene_times = json.load(scenes_file)
    for scene in scene_times:
        texts, objs, labels = label_scene(video_id, scene['Scene Number'])
        if texts:
            text_result = texts[0]['text'].splitlines()
        else: 
            text_result = []
        object_result = {}
        label_result = []
        if objs:
            for obj in objs:
                obj_data = {}
                pos, size = get_pos_size(obj)
                obj_data['pos'] = pos
                obj_data['size'] = size
                object_result[obj['object']] = obj_data
        for label in labels:
            label_result.append(label['label'])
        scene.update({'texts': text_result,  'objects': object_result, 'labels': label_result}) 
  

# dump rewrite the updated scene labels to video_id.json file
with open(video_id + '.json', 'w') as write_file:
    json.dump(scene_times, write_file, indent=4)




# label_scene(video_id)