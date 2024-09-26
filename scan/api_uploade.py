from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import cv2
import face_recognition
import firebase_admin
from firebase_admin import credentials, storage

app = FastAPI()

# ตั้งค่า CORS
origins = [
    "http://localhost:3000",  # URL ของ React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
cred = credentials.Certificate("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/try/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': "face-recognition-3e9a6.appspot.com"
})

os.makedirs('temp_images', exist_ok=True)
os.makedirs('processed_images', exist_ok=True)

def crop_and_resize_face(image_path):
    img = cv2.imread(image_path)
    face_locations = face_recognition.face_locations(img)
    
    if face_locations:
        top, right, bottom, left = face_locations[0]
        face_image = img[top:bottom, left:right]
        resized_face = cv2.resize(face_image, (216, 216))
        return resized_face
    return None

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # ตรวจสอบประเภทไฟล์
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return {"message": "File type not supported. Please upload an image."}
    
    file_location = f"temp_images/{file.filename}"
    
    # บันทึกไฟล์
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    # ประมวลผลภาพเพื่อตรวจจับใบหน้า
    face_img = crop_and_resize_face(file_location)
    
    if face_img is not None:
        resized_file_location = f"processed_images/{file.filename}"
        cv2.imwrite(resized_file_location, face_img)
        
        # อัปโหลดไปยัง Firebase
        bucket = storage.bucket()
        try:
            blob = bucket.blob(file.filename)
            blob.upload_from_filename(resized_file_location)
        except Exception as e:
            return {"message": f"Failed to upload to Firebase: {str(e)}"}
        
        # ลบไฟล์ที่ใช้แล้ว
        os.remove(file_location)
        os.remove(resized_file_location)
        
        file_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{file.filename}?alt=media"
        print(f"Uploaded {file.filename} successfully.")
        return {"message": f"Successfully " }
    else:
        os.remove(file_location)
        return {"message": "No face detected in the image."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
