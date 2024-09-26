import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate("try/serviceAccountKey.json")
firebase_admin.initialize_app(cred , {'databaseURL': "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app/"})

ref = db.reference('Students')

data = {
    "6421604803":
    {
            'name-lastname' : "Natnaphat Petruang",
            "major": "Comsci",
            "starting_year": 2021,
            "total_attendance": 1,
            "standing": "G",
            "year": 4,
            "last_attendance_time": "2024-6-26 9:00:34"
    },
    "22222222":{
            'name-lastname' : "Natnaphat Petruang",
            "major": "Comsci",
            "starting_year": 2021,
            "total_attendance": 1,
            "standing": "G",
            "year": 4,
            "last_attendance_time": "2024-6-26 9:00:34"
    },
    "963852":
        {
            'name-lastname' : "Elon Musk",
            "major": "Physics",
            "starting_year": 2020,
            "total_attendance": 8,
            "standing": "B",
            "year": 2,
            "last_attendance_time": "2022-12-11 00:54:34"
        },
    "852741":
        {
            "name-lastname": "Emly Blunt",
            "major": "Economics",
            "starting_year": 2021,
            "total_attendance": 12,
            "standing": "B",
            "year": 1,
            "last_attendance_time": "2022-12-11 00:54:34"
        },
        "321654":
        {
            "name-lastname": "Murtaza Hassan",
            "major": "Robotics",
            "starting_year": 2017,
            "total_attendance": 7,
            "standing": "G",
            "year": 4,
            "last_attendance_time": "2022-12-11 00:54:34"
        }
}

for key, value in data.items():
    ref.child(key).set(value)