"""Detects text in the file."""
# from google.cloud import vision
# import io
# client = vision.ImageAnnotatorClient()
# path = '/Users/mina/Desktop/frames/out_image6894.jpg'
import os
import clip
import torch
from torchvision.datasets import CIFAR100

# Load the model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load('ViT-B/32', device)

# Download the dataset
cifar100 = CIFAR100(root=os.path.expanduser("~/.cache"), download=True, train=False)

# Prepare the inputs
image, class_id = cifar100[3637]
image_input = preprocess(image).unsqueeze(0).to(device)
text_inputs = torch.cat([clip.tokenize(f"a photo of a {c}") for c in cifar100.classes]).to(device)

# Calculate features
with torch.no_grad():
    image_features = model.encode_image(image_input)
    text_features = model.encode_text(text_inputs)

# Pick the top 5 most similar labels for the image
image_features /= image_features.norm(dim=-1, keepdim=True)
text_features /= text_features.norm(dim=-1, keepdim=True)
similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
values, indices = similarity[0].topk(5)

# Print the result
print("\nTop predictions:\n")
for value, index in zip(values, indices):
    print(f"{cifar100.classes[index]:>16s}: {100 * value.item():.2f}%")

# def detect_text(path):
#     """Detects text in the file."""
#     from google.cloud import vision
#     import io
#     client = vision.ImageAnnotatorClient()

#     with io.open(path, 'rb') as image_file:
#         content = image_file.read()

#     image = vision.Image(content=content)

#     response = client.text_detection(image=image)
#     texts = response.text_annotations
#     print('Texts:')

#     for text in texts:
#         print('\n"{}"'.format(text.description))

#         vertices = (['({},{})'.format(vertex.x, vertex.y)
#                     for vertex in text.bounding_poly.vertices])

#         print('bounds: {}'.format(','.join(vertices)))

#     if response.error.message:
#         raise Exception(
#             '{}\nFor more info on error messages, check: '
#             'https://cloud.google.com/apis/design/errors'.format(
#                 response.error.message))

# def detect_labels(path):
#     """Detects labels in the file."""
#     from google.cloud import vision
#     import io
#     client = vision.ImageAnnotatorClient()

#     with io.open(path, 'rb') as image_file:
#         content = image_file.read()

#     image = vision.Image(content=content)

#     response = client.label_detection(image=image)
#     labels = response.label_annotations
#     print('Labels:')

#     for label in labels:
#         print(label.description)

#     if response.error.message:
#         raise Exception(
#             '{}\nFor more info on error messages, check: '
#             'https://cloud.google.com/apis/design/errors'.format(
#                 response.error.message))

                
# def localize_objects(path):
#     """Localize objects in the local image.

#     Args:
#     path: The path to the local file.
#     """
#     from google.cloud import vision
#     client = vision.ImageAnnotatorClient()

#     with open(path, 'rb') as image_file:
#         content = image_file.read()
#     image = vision.Image(content=content)

#     objects = client.object_localization(
#         image=image).localized_object_annotations

#     print('Number of objects found: {}'.format(len(objects)))
#     for object_ in objects:
#         print('\n{} (confidence: {})'.format(object_.name, object_.score))
#         print('Normalized bounding polygon vertices: ')
#         for vertex in object_.bounding_poly.normalized_vertices:
#             print(' - ({}, {})'.format(vertex.x, vertex.y))

# def detect_web(path):
#     """Detects web annotations given an image."""
#     from google.cloud import vision
#     import io
#     client = vision.ImageAnnotatorClient()

#     with io.open(path, 'rb') as image_file:
#         content = image_file.read()

#     image = vision.Image(content=content)

#     response = client.web_detection(image=image)
#     annotations = response.web_detection

#     if annotations.best_guess_labels:
#         for label in annotations.best_guess_labels:
#             print('\nBest guess label: {}'.format(label.label))

#     if annotations.pages_with_matching_images:
#         print('\n{} Pages with matching images found:'.format(
#             len(annotations.pages_with_matching_images)))

#         for page in annotations.pages_with_matching_images:
#             print('\n\tPage url   : {}'.format(page.url))

#             if page.full_matching_images:
#                 print('\t{} Full Matches found: '.format(
#                        len(page.full_matching_images)))

#                 for image in page.full_matching_images:
#                     print('\t\tImage url  : {}'.format(image.url))

#             if page.partial_matching_images:
#                 print('\t{} Partial Matches found: '.format(
#                        len(page.partial_matching_images)))

#                 for image in page.partial_matching_images:
#                     print('\t\tImage url  : {}'.format(image.url))

#     if annotations.web_entities:
#         print('\n{} Web entities found: '.format(
#             len(annotations.web_entities)))

#         for entity in annotations.web_entities:
#             print('\n\tScore      : {}'.format(entity.score))
#             print(u'\tDescription: {}'.format(entity.description))

#     if annotations.visually_similar_images:
#         print('\n{} visually similar images found:\n'.format(
#             len(annotations.visually_similar_images)))

#         for image in annotations.visually_similar_images:
#             print('\tImage url    : {}'.format(image.url))

#     if response.error.message:
#         raise Exception(
#             '{}\nFor more info on error messages, check: '
#             'https://cloud.google.com/apis/design/errors'.format(
#                 response.error.message))

                

# # detect_text(path)
# localize_objects(path)
# detect_labels(path)
# detect_web(path)