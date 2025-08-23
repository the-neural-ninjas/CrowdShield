
import cv2
import pandas as pd
import numpy as np
from ultralytics import YOLO
from tracker import Tracker
import cvzone
import os
import torch

def entry_exit_video_processing():
    torch.cuda.is_available = lambda : False
    
    model = YOLO('yolov8s.pt')
    
    input_video = 'zone4.mp4'
    output_video = 'zone4out.mp4'
    
    if not os.path.exists(input_video):
        print(f"Error: {input_video} not found!")
        return
    
    cap = cv2.VideoCapture(input_video)
    
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video properties: {width}x{height} @ {fps}fps")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video, fourcc, fps, (width, height))
    
    with open('object_class.names', 'r') as file:
        class_list = file.read().split('\n')
    
    tracker = Tracker()
    
    previous_positions = {}
    
    entry_count = 0
    exit_count = 0
    
    center_line_x = width // 2
    
    frame_count = 0
    
    print(f"Processing {input_video}...")
    print(f"Center line at x = {center_line_x}")
    print("Using CPU for processing...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        results = model.predict(frame, conf=0.5, device='cpu')
        
        a = results[0].boxes.data
        px = pd.DataFrame(a).astype("float")
        
        person_list = []
        for index, row in px.iterrows():
            x1, y1, x2, y2, conf, d = row
            if conf > 0.5:
                class_name = class_list[int(d)]
                if 'person' in class_name:
                    person_list.append([int(x1), int(y1), int(x2), int(y2)])
        
        bbox_id = tracker.update(person_list)
        
        current_positions = {}
        
        for bbox in bbox_id:
            x3, y3, x4, y4, id = bbox
            cx = int((x3 + x4) // 2)
            cy = int((y3 + y4) // 2)
            
            current_positions[id] = (cx, cy)
            
            cv2.rectangle(frame, (x3, y3), (x4, y4), (0, 255, 0), 2)
            
            cv2.circle(frame, (cx, cy), 4, (255, 0, 255), -1)
            
            cvzone.putTextRect(frame, f'{id}', (x3, y3), 1, 2)
            
            if id in previous_positions:
                prev_x, prev_y = previous_positions[id]
                
                if (prev_x < center_line_x and cx >= center_line_x):
                    entry_count += 1
                    print(f"Person {id} ENTERED (left to right) - Entry count: {entry_count}")
                    
                    cv2.circle(frame, (cx, cy), 15, (0, 255, 0), 3)
                    cvzone.putTextRect(frame, 'ENTRY', (cx-30, cy-30), 1, 2, colorR=(0, 255, 0))
                    
                elif (prev_x > center_line_x and cx <= center_line_x):
                    exit_count += 1
                    print(f"Person {id} EXITED (right to left) - Exit count: {exit_count}")
                    
                    cv2.circle(frame, (cx, cy), 15, (0, 0, 255), 3)
                    cvzone.putTextRect(frame, 'EXIT', (cx-30, cy-30), 1, 2, colorR=(0, 0, 255))
        
        previous_positions = current_positions.copy()
        
        cv2.line(frame, (center_line_x, 0), (center_line_x, height), (255, 255, 255), 3)
        
        cvzone.putTextRect(frame, f'Entry: {entry_count}', (245, 25), 2, 2, colorR=(0, 255, 0))
        cvzone.putTextRect(frame, f'Exit: {exit_count}', (25, 25), 2, 2, colorR=(0, 0, 255))
        
        cvzone.putTextRect(frame, f'Frame: {frame_count}', (15, 80), 1, 1)
        cvzone.putTextRect(frame, f'Density: {entry_count+exit_count}', (15, 130), 1, 1)
        
        cv2.putText(frame, f'Density: {entry_count + exit_count}', (10, height - 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, f'FPS: {fps}', (10, height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        out.write(frame)
        
        if frame_count % 30 == 0:
            print(f"Processed {frame_count} frames - Entry: {entry_count}, Exit: {exit_count}")
        
        cv2.imshow('Entry/Exit Counter', frame)
        if cv2.waitKey(1) & 0xff == 27:
            break
    
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    print(f"\nProcessing complete!")
    print(f"Output saved as: {output_video}")
    print(f"Final counts - Entry: {entry_count}, Exit: {exit_count}")
    print(f"Total frames processed: {frame_count}")
    print(f"Net flow: {entry_count - exit_count}")

if __name__ == "__main__":
    entry_exit_video_processing() 