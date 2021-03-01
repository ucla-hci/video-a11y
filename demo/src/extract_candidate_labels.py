import spacy
nlp = spacy.load('en_core_web_sm')
path = './GMVbQ1UsMp8.txt'
with open(path, 'r') as file_to_read:
    subtitle = file_to_read.read()
    doc = nlp(subtitle)
candidate_captions = []
for np in doc.noun_chunks:
    print(np.text)
    candidate_captions.append(np.text)

import clip
import torch
from torchvision.datasets import CIFAR100
from PIL import Image

# Load the model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load('ViT-B/32', device)

# Download the dataset
cifar100 = CIFAR100(root=os.path.expanduser("~/.cache"), download=True, train=False)

# candidate_captions = ['banana plant with human','banana plant with human and text', 'human', 'banana plant', 'person','ant', 'zebra', 'candy',  'bird', 'bus']
# Prepare the inputs
image = Image.open('./frames/out_image7541.jpg')
# image, class_id = cifar100[3637]
image_input = preprocess(image).unsqueeze(0).to(device)
text_inputs = torch.cat([clip.tokenize(f"a photo of a {c}") for c in candidate_captions]).to(device)


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
    print(f"{candidate_captions[index]:>16s}: {100 * value.item():.2f}%")