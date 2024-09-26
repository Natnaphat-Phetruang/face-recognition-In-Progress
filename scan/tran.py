from ultralytics import YOLO

model = YOLO('yolov8n.pt')

def main():
    model.train(data='data\\dataoff.yaml', epochs=3 ,batch = 4)

if __name__ == '__main__':
    main()
