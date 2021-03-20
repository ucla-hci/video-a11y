"""Detects text in the file."""
# from google.cloud import vision
# import io
# client = vision.ImageAnnotatorClient()
path = '/Users/mina/Desktop/hecate/output/'
video_path = '/Users/mina/Desktop/sample_video_short.mp4'
import os
# import clip
# import torch
import matplotlib.pyplot as plt
import argparse
from google.cloud import videointelligence
from google.cloud import vision
import io
from os import listdir
from os.path import isfile, join
from google.oauth2 import service_account
onlyfiles = [f for f in listdir(path) if isfile(join(path, f))]
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/mina/Desktop/VideoA11y-3de01f8ba626.json"
# from torchvision.datasets import CIFAR100

# # Load the model
# device = "cuda" if torch.cuda.is_available() else "cpu"
# model, preprocess = clip.load('ViT-B/32', device)

# # Download the dataset
# cifar100 = CIFAR100(root=os.path.expanduser("~/.cache"), download=True, train=False)

# # Prepare the inputs
# image, class_id = cifar100[3637]
# image_input = preprocess(image).unsqueeze(0).to(device)
# text_inputs = torch.cat([clip.tokenize(f"a photo of a {c}") for c in cifar100.classes]).to(device)

# # Calculate features
# with torch.no_grad():
#     image_features = model.encode_image(image_input)
#     text_features = model.encode_text(text_inputs)

# # Pick the top 5 most similar labels for the image
# image_features /= image_features.norm(dim=-1, keepdim=True)
# text_features /= text_features.norm(dim=-1, keepdim=True)
# similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
# values, indices = similarity[0].topk(5)

# # Print the result
# print("\nTop predictions:\n")
# for value, index in zip(values, indices):
#     print(f"{cifar100.classes[index]:>16s}: {100 * value.item():.2f}%")

def video_track_object(path):
    video_client = videointelligence.VideoIntelligenceServiceClient()
    features = [videointelligence.Feature.OBJECT_TRACKING]

    with io.open(path, "rb") as file:
        input_content = file.read()

    operation = video_client.annotate_video(
        request={"features": features, "input_content": input_content}
    )
    print("\nProcessing video for object annotations.")

    result = operation.result(timeout=300)
    print("\nFinished processing.\n")

    # The first result is retrieved because a single video was processed.
    object_annotations = result.annotation_results[0].object_annotations

    # Get only the first annotation for demo purposes.
    # object_annotation = object_annotations[0]
    for object_annotation in object_annotations:

        print("Entity description: {}".format(object_annotation.entity.description))
        if object_annotation.entity.entity_id:
            print("Entity id: {}".format(object_annotation.entity.entity_id))

        print(
            "Segment: {}s to {}s".format(
                object_annotation.segment.start_time_offset.seconds
                + object_annotation.segment.start_time_offset.microseconds / 1e6,
                object_annotation.segment.end_time_offset.seconds
                + object_annotation.segment.end_time_offset.microseconds / 1e6,
            )
        )

        print("Confidence: {}".format(object_annotation.confidence))

        # Here we print only the bounding box of the first frame in this segment
        frame = object_annotation.frames[0]
        box = frame.normalized_bounding_box
        print(
            "Time offset of the first frame: {}s".format(
                frame.time_offset.seconds + frame.time_offset.microseconds / 1e6
            )
        )
        print("Bounding box position:")
        print("\tleft  : {}".format(box.left))
        print("\ttop   : {}".format(box.top))
        print("\tright : {}".format(box.right))
        print("\tbottom: {}".format(box.bottom))
        print("\n")


def detect_text(path):
    """Detects text in the file."""

    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations
    print('Texts:')

    for text in texts:
        print('\n"{}"'.format(text.description))

        vertices = (['({},{})'.format(vertex.x, vertex.y)
                    for vertex in text.bounding_poly.vertices])

        print('bounds: {}'.format(','.join(vertices)))

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))

def detect_labels(path):
    """Detects labels in the file."""
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations
    print('Labels:')

    for label in labels:
        print(label.description)

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))

                
def localize_objects(path):
    """Localize objects in the local image.

    Args:
    path: The path to the local file.
    """
    client = vision.ImageAnnotatorClient()

    with open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    objects = client.object_localization(
        image=image).localized_object_annotations

    print('Number of objects found: {}'.format(len(objects)))
    for object_ in objects:
        print('\n{} (confidence: {})'.format(object_.name, object_.score))
        print('Normalized bounding polygon vertices: ')
        for vertex in object_.bounding_poly.normalized_vertices:
            print(' - ({}, {})'.format(vertex.x, vertex.y))

def detect_web(path):
    """Detects web annotations given an image."""

    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.web_detection(image=image)
    annotations = response.web_detection

    if annotations.best_guess_labels:
        for label in annotations.best_guess_labels:
            print('\nBest guess label: {}'.format(label.label))

    if annotations.pages_with_matching_images:
        print('\n{} Pages with matching images found:'.format(
            len(annotations.pages_with_matching_images)))

        for page in annotations.pages_with_matching_images:
            print('\n\tPage url   : {}'.format(page.url))

            if page.full_matching_images:
                print('\t{} Full Matches found: '.format(
                       len(page.full_matching_images)))

                for image in page.full_matching_images:
                    print('\t\tImage url  : {}'.format(image.url))

            if page.partial_matching_images:
                print('\t{} Partial Matches found: '.format(
                       len(page.partial_matching_images)))

                for image in page.partial_matching_images:
                    print('\t\tImage url  : {}'.format(image.url))

    if annotations.web_entities:
        print('\n{} Web entities found: '.format(
            len(annotations.web_entities)))

        for entity in annotations.web_entities:
            print('\n\tScore      : {}'.format(entity.score))
            print(u'\tDescription: {}'.format(entity.description))

    if annotations.visually_similar_images:
        print('\n{} visually similar images found:\n'.format(
            len(annotations.visually_similar_images)))

        for image in annotations.visually_similar_images:
            print('\tImage url    : {}'.format(image.url))

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))

                
# video_track_object(video_path)
for path in onlyfiles:
    path = '/Users/mina/Desktop/hecate/output/sample_video-Scene-033_00.png' 
    detect_text(path)
    localize_objects(path)
    detect_labels(path)
    detect_web(path)
    break
# for loop
# first check with _00 image
    # if no text or object check _01 or _02
        # provide label: this image might contain ~
    # if text
        # save each line as text element w/ bounding box info
    # if object
        # cut and get color API
        # save each object as obj element w/ bounding box info + color 
        # check containing relation betwen elements
        # provide exploration - Objects ordered with size. For overlapping, provide smaller ones connected to large ones. 
        # s -> size
        # c -> color
        # p -> position
    # if no object
        # provide label: this image might contain ~


mydic = {
  "annotations": [
  {
    "class": "rect",
    "height": 98,
    "width": 113,
    "x": 177,
    "y": 12
  },
  {
    "class": "rect",
    "height": 80,
    "width": 87,
    "x": 373,
    "y": 43
  }
 ],
   "class": "image",
   "filename": "https://i.stack.imgur.com/9qe6z.png"
}


def crop(dic, i):
    image = plt.imread(dic["filename"])
    x0 = dic["annotations"][i]["x"]
    y0 = dic["annotations"][i]["y"]
    width = dic["annotations"][i]["width"]
    height = dic["annotations"][i]["height"]
    return image[y0:y0+height , x0:x0+width, :]


fig = plt.figure()
ax = fig.add_subplot(121)
ax.imshow(plt.imread(mydic["filename"]))

ax1 = fig.add_subplot(222)
ax1.imshow(crop(mydic, 0))

ax2 = fig.add_subplot(224)
ax2.imshow(crop(mydic, 1))

plt.show()