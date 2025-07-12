import requests

url = "http://localhost:8000/ai/imageSearch"
file_path = "testImage.jpg"  # path to the image file

with open(file_path, "rb") as img_file:
    files = {"image": ("sample.jpg", img_file, "image/jpeg")}
    response = requests.post(url, files=files)

print(response.json())



query_json = {
'query_type' : 'text',
'content':{
            'text_query': "I need a blue t-shirt, size large from hnm."
            },
'uid': "1234",
'action':"toolagent"
}



url = "http://localhost:8000/ai/agentQuery"

response = requests.post(url, json=query_json)

print(response.json())



