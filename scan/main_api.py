import cv2
import os
import pickle
import face_recognition
import numpy as np
import cvzone
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage
from datetime import datetime
import time
from face_checker import FaceCheckwahummanjinba
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import base64
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ปรับได้ตามต้องการ เช่น ["http://localhost", "http://example.com"]
    allow_credentials=True,
    allow_methods=["*"],  # ปรับให้เป็นเฉพาะ method ที่ต้องการ
    allow_headers=["*"],  # ปรับให้เป็นเฉพาะ headers ที่ต้องการ
)


# # Mount static files
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Jinja2 templates
templates = Jinja2Templates(directory="C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/templates")

# Initialize Firebase
cred = credentials.Certificate("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/try/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app/",
    'storageBucket': "face-recognition-3e9a6.appspot.com"
})

bucket = storage.bucket()

# Load Background and Modes
imgBackground = cv2.imread('C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Resources/background.png')
if imgBackground is None:
    raise ValueError("Background image not found or failed to load.")

folderModePath = 'C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Resources/Modes'
modePathList = os.listdir(folderModePath)
imgModeList = []
for path in modePathList:
    img = cv2.imread(os.path.join(folderModePath, path))
    if img is None:
        raise ValueError(f"Mode image {path} not found or failed to load.")
    imgModeList.append(img)

# Load Encode File
print("Loading Encode File ...")
with open('EncodeFile.p', 'rb') as file:
    ListKnownWithIds = pickle.load(file)
encodeListKnown, studentIds = ListKnownWithIds

# Initialize FaceChecker
face_checker = FaceCheckwahummanjinba("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/model/l_version_1_300.pt")

# Initialize Variables
modeType = 0
counter = 0
studentInfo = []
imgStudent = None

def process_image_frame(img):
    global imgBackground, modeType, counter, studentInfo, imgStudent
    imgBackground = np.copy(imgBackground)  # Ensure we work with a fresh copy
    
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
    
    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)
    
    imgBackground[162:162 + 480, 55:55 + 640] = img
    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

    if faceCurFrame:
        # Use FaceChecker to check if face is real or fake
        is_real = face_checker.check_face(imgBackground[162:162 + 480, 55:55 + 640])
        if is_real:
            for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
                matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
                faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
                matchIndex = np.argmin(faceDis)

                if matches[matchIndex]:
                    y1, x2, y2, x1 = faceLoc
                    y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                    bbox = 55 + x1, 162 + y1, x2 - x1, y2 - y1
                    imgBackground = cvzone.cornerRect(imgBackground, bbox, rt=0)
                    id = studentIds[matchIndex]
                    
                    if counter == 0:
                        cvzone.putTextRect(imgBackground, "Loading", (275, 300))
                        cv2.imshow("Face Attendance", imgBackground)
                        cv2.waitKey(1)
                        counter = 1
                        modeType = 1

            if counter != 0:
                if counter == 1:
                    studentInfo = db.reference(f'Students/{id}').get()
                    print(studentInfo)
                    blob_jpg = bucket.get_blob(f'{id}.jpg')
                    blob_png = bucket.get_blob(f'{id}.png')
                    blob = blob_png if blob_png else blob_jpg
                            
                    if blob:
                        array = np.frombuffer(blob.download_as_string(), np.uint8)
                        imgStudent = cv2.imdecode(array, cv2.IMREAD_COLOR)
                        if imgStudent is None or imgStudent.size == 0:
                            print(f"Failed to decode image for student ID {id}")
                        elif imgStudent.shape[:2] != (216, 216):
                            print(f"Image size for student ID {id} is not 216x216")
                            imgStudent = None
                    else:
                        print(f"No image found for student ID {id}")

                    datetimeObject = datetime.strptime(studentInfo['last_attendance_time'], "%Y-%m-%d %H:%M:%S")
                    secondsElapsed = (datetime.now() - datetimeObject).total_seconds()
                    print(secondsElapsed)
                    if secondsElapsed > 30:
                        ref = db.reference(f'Students/{id}')
                        studentInfo['total_attendance'] += 1
                        ref.child('total_attendance').set(studentInfo['total_attendance'])
                        ref.child('last_attendance_time').set(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                    else:
                        modeType = 3
                        counter = 0
                        imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

                if modeType != 3:
                    if 10 < counter < 20:
                        modeType = 2

                    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

                    if counter <= 10:
                        cv2.putText(imgBackground, str(studentInfo['total_attendance']), (861, 125),
                                    cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 1)
                        cv2.putText(imgBackground, str(studentInfo['major']), (1006, 550),
                                    cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)
                        cv2.putText(imgBackground, str(id), (1006, 493),
                                    cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)
                        cv2.putText(imgBackground, str(studentInfo['standing']), (910, 625),
                                    cv2.FONT_HERSHEY_COMPLEX, 0.6, (100, 100, 100), 1)
                        cv2.putText(imgBackground, str(studentInfo['year']), (1025, 625),
                                    cv2.FONT_HERSHEY_COMPLEX, 0.6, (100, 100, 100), 1)
                        cv2.putText(imgBackground, str(studentInfo['starting_year']), (1125, 625),
                                    cv2.FONT_HERSHEY_COMPLEX, 0.6, (100, 100, 100), 1)

                        (w, h), _ = cv2.getTextSize(studentInfo['name-lastname'], cv2.FONT_HERSHEY_COMPLEX, 1, 1)
                        offset = (414 - w) // 2
                        cv2.putText(imgBackground, str(studentInfo['name-lastname']), (808 + offset, 445),
                                    cv2.FONT_HERSHEY_COMPLEX, 1, (50, 50, 50), 1)

                        if imgStudent is not None:
                            imgBackground[175:175 + 216, 909:909 + 216] = imgStudent

                    counter += 1

                    if counter >= 20:
                        counter = 0
                        modeType = 0
                        studentInfo = []
                        imgStudent = None
                        imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]
        else:
            modeType = 0
            counter = 0

    return imgBackground

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(0)
    
    retries = 5
    while retries > 0:
        try:
            if not cap.isOpened():
                cap.open(0)
            
            while True:
                success, img = cap.read()
                if not success:
                    raise ValueError("Failed to read image from camera")
                
                imgBackground = process_image_frame(img)
                
                _, img_encoded = cv2.imencode('.jpg', imgBackground)
                img_base64 = base64.b64encode(img_encoded).decode('utf-8')
                
                await websocket.send_text(img_base64)
        except (ValueError, ConnectionResetError) as e:
            print(f"Error occurred: {e}. Retrying...")
            retries -= 1
            time.sleep(2)  # รอเวลาสักครู่ก่อน retry
            if retries == 0:
                print("Failed to connect after several retries.")
                await websocket.close()
                break


@app.get("/process", response_class=FileResponse)
async def process_image():
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    success, img = cap.read()
    imgBackground = process_image_frame(img)

    # Save the result image to static folder
    output_path = "static/images/processed_image.png"
    cv2.imwrite(output_path, imgBackground)
    
    return output_path
