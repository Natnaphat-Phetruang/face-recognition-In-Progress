import cv2
import face_recognition
import pickle
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage

# Initialize Firebase
cred = credentials.Certificate("try/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app/",
    'storageBucket': "face-recognition-3e9a6.appspot.com"
})

# Ensure the directories exist
os.makedirs('Files/Images', exist_ok=True)
os.makedirs('processed_images', exist_ok=True)
os.makedirs('temp_images', exist_ok=True)  # เพิ่มการสร้างโฟลเดอร์ temp_images

# เอารูปเข้ามา
folderPath = 'Files/Images'
PathList = os.listdir(folderPath)
print(PathList)
imgList = []
studentIds = []
filesupload = []

# ฟังก์ชันหา encoding ของภาพ
def findEncoding(imagesList):
    encodeList = []
    for img, path in zip(imagesList, PathList):
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(img)
        if face_locations:
            encode = face_recognition.face_encodings(img, face_locations)[0]
            encodeList.append(encode)
            filesupload.append(path)
        else:
            print(f"No face found in image: {path}")
    return encodeList

# ฟังก์ชันตัดภาพให้เหลือเฉพาะใบหน้าและปรับขนาด
def cropface(image, face_location, size=(216, 216)):
    top, right, bottom, left = face_location
    face_image = image[top:bottom, left:right]
    h, w = face_image.shape[:2]

    if h != size[0] or w != size[1]:
        resized_face = cv2.resize(face_image, (size[1], size[0]))
    else:
        resized_face = face_image
    
    return resized_face

# อ่านภาพจากไฟล์และสร้างรายการ studentIds
for path in PathList:
    imgList.append(cv2.imread(os.path.join(folderPath, path)))
    studentIds.append(os.path.splitext(path)[0])

print("Encoding start")
ListKnown = findEncoding(imgList)
ListKnownWithIds = [ListKnown, studentIds[:len(ListKnown)]]
print("Encoding complete")

# บันทึกไฟล์ encoding ลงในไฟล์ .p
with open("EncodeFile.p", 'wb') as file:
    pickle.dump(ListKnownWithIds, file)
print("File Saved")

# อัปโหลดรูปภาพไปยัง Firebase Storage และปรับขนาด
bucket = storage.bucket()
for img, path in zip(imgList, PathList):
    face_locations = face_recognition.face_locations(img)
    if face_locations:
        face_img = cropface(img, face_locations[0])
        processed_file_path = f'processed_images/{path}'
        cv2.imwrite(processed_file_path, face_img)
        
        # อัปโหลดไปยัง Firebase
        blob = bucket.blob(path)
        blob.upload_from_filename(processed_file_path)
        print(f"Uploaded {processed_file_path} to Firebase Storage.")
    else:
        print(f"No face found in image: {path}")
