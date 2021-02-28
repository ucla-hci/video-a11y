import json


json_data = {}
with open('frame_timestamps.json') as json_file:
    json_data = json.load(json_file)

data = {}
frame_data = {}
with open('frame_result.txt', 'r') as f:
    lines = f.readlines()
    frame_index = 0
    for line in lines:
        jpg_index = line.find("jpg")
        if jpg_index != -1:
            data[frame_index]= frame_data
            frame_data = {}
            frame_index = int(line[:jpg_index-1])
            frame_data['objects'] = {}
            frame_data['time'] = round(json_data[frame_index]['timestamp'], 3)
            continue
        elif "%" in line:
            object_data = {}
            obj_index =  line.find(":")
            left_x_index = line.find(":", obj_index+1)
            top_y_index = line.find(":", left_x_index+1)
            width_index = line.find(":", top_y_index+1)
            height_index = line.find(":", width_index+1)
            
            obj = line[:obj_index]
            left_x = int(line[left_x_index+1:left_x_index+6])
            top_y = int(line[top_y_index+1:top_y_index+6])
            width = int(line[width_index+1:width_index+6])
            height = int(line[height_index+1:height_index+6])

            object_data['left_x'] = left_x
            object_data['top_y'] = top_y
            object_data['width'] = width
            object_data['height'] = height
            frame_data['objects'][obj] = object_data
        else:
            continue 

# data = sorted(data.items(), key=lambda i: int(i[0]))
print(data)
with  open("frames_data.json", "w") as json_file2:
    json.dump(data, json_file2)

