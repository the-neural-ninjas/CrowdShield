import cv2
import numpy as np
from ultralytics import YOLO
import threading
import time
import os
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PersonCounterService:
    def __init__(self):
        self.model = None
        self.is_running = False
        self.current_counts = {
            'entry': 0,
            'exit': 0,
            'density': 0
        }
        self.processing_thread = None
        self.stream_url = None
        self.zone = None
        self.lock = threading.Lock()
        
    def initialize_model(self):
        """Initialize the YOLO model for person detection"""
        try:
            logger.info("Initializing YOLO model...")
            self.model = YOLO('yolov8s.pt')
            logger.info("YOLO model initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize YOLO model: {e}")
            return False
    
    def start_counting(self, stream_url: str, zone: str) -> Dict[str, Any]:
        """Start person counting on the live stream"""
        try:
            if self.is_running:
                return {
                    'success': False,
                    'message': 'Person counting is already running'
                }
            
            if not self.model:
                if not self.initialize_model():
                    return {
                        'success': False,
                        'message': 'Failed to initialize AI model'
                    }
            
            self.stream_url = stream_url
            self.zone = zone
            self.is_running = True
            
            # Reset counts
            with self.lock:
                self.current_counts = {'entry': 0, 'exit': 0, 'density': 0}
            
            # Start processing in a separate thread
            self.processing_thread = threading.Thread(target=self._process_stream)
            self.processing_thread.daemon = True
            self.processing_thread.start()
            
            logger.info(f"Started person counting for {zone} at {stream_url}")
            
            return {
                'success': True,
                'message': f'Person counting started for {zone}',
                'stream_url': stream_url,
                'zone': zone
            }
            
        except Exception as e:
            logger.error(f"Failed to start person counting: {e}")
            return {
                'success': False,
                'message': f'Failed to start person counting: {str(e)}'
            }
    
    def stop_counting(self) -> Dict[str, Any]:
        """Stop person counting"""
        try:
            self.is_running = False
            
            if self.processing_thread and self.processing_thread.is_alive():
                self.processing_thread.join(timeout=5)
            
            logger.info("Person counting stopped")
            
            return {
                'success': True,
                'message': 'Person counting stopped',
                'final_counts': self.current_counts.copy()
            }
            
        except Exception as e:
            logger.error(f"Failed to stop person counting: {e}")
            return {
                'success': False,
                'message': f'Failed to stop person counting: {str(e)}'
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current counting status and counts"""
        with self.lock:
            return {
                'success': True,
                'status': 'running' if self.is_running else 'stopped',
                'counts': self.current_counts.copy(),
                'stream_url': self.stream_url,
                'zone': self.zone
            }
    
    def _process_stream(self):
        """Process the live stream and count people"""
        try:
            logger.info(f"Starting stream processing for {self.zone}")
            
            # Open the stream
            cap = cv2.VideoCapture(self.stream_url)
            
            if not cap.isOpened():
                logger.error(f"Failed to open stream: {self.stream_url}")
                return
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
            
            logger.info(f"Stream properties: {width}x{height} @ {fps}fps")
            
            # Initialize tracking variables
            center_line_x = width // 2
            previous_positions = {}
            frame_count = 0
            
            while self.is_running:
                ret, frame = cap.read()
                if not ret:
                    logger.warning("Failed to read frame, retrying...")
                    time.sleep(0.1)
                    continue
                
                frame_count += 1
                
                try:
                    # Run YOLO detection
                    results = self.model.predict(frame, conf=0.5, device='cpu', verbose=False)
                    
                    if results and len(results) > 0:
                        boxes = results[0].boxes
                        if boxes is not None:
                            # Process detections
                            person_list = []
                            for box in boxes:
                                if box.conf > 0.5 and int(box.cls) == 0:  # person class
                                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                                    person_list.append([x1, y1, x2, y2])
                            
                            # Simple tracking and counting
                            current_positions = {}
                            
                            for i, (x1, y1, x2, y2) in enumerate(person_list):
                                cx = int((x1 + x2) // 2)
                                cy = int((y1 + y2) // 2)
                                
                                current_positions[i] = (cx, cy)
                                
                                # Draw bounding box
                                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                                cv2.circle(frame, (cx, cy), 4, (255, 0, 255), -1)
                                
                                # Check for entry/exit
                                if i in previous_positions:
                                    prev_x, prev_y = previous_positions[i]
                                    
                                    if (prev_x < center_line_x and cx >= center_line_x):
                                        with self.lock:
                                            self.current_counts['entry'] += 1
                                        logger.info(f"Person {i} ENTERED - Entry count: {self.current_counts['entry']}")
                                        
                                    elif (prev_x > center_line_x and cx <= center_line_x):
                                        with self.lock:
                                            self.current_counts['exit'] += 1
                                        logger.info(f"Person {i} EXITED - Exit count: {self.current_counts['exit']}")
                            
                            previous_positions = current_positions.copy()
                            
                            # Update density (current people in frame)
                            with self.lock:
                                self.current_counts['density'] = len(person_list)
                            
                            # Draw center line
                            cv2.line(frame, (center_line_x, 0), (center_line_x, height), (255, 255, 255), 3)
                            
                            # Draw counts on frame
                            with self.lock:
                                cv2.putText(frame, f'Entry: {self.current_counts["entry"]}', (10, 30),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                                cv2.putText(frame, f'Exit: {self.current_counts["exit"]}', (10, 70),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                                cv2.putText(frame, f'Density: {self.current_counts["density"]}', (10, 110),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                                cv2.putText(frame, f'Zone: {self.zone}', (10, height - 20),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    
                    # Log progress every 30 frames
                    if frame_count % 30 == 0:
                        with self.lock:
                            logger.info(f"Processed {frame_count} frames - Entry: {self.current_counts['entry']}, "
                                       f"Exit: {self.current_counts['exit']}, Density: {self.current_counts['density']}")
                    
                    # Small delay to prevent overwhelming the system
                    time.sleep(1.0 / fps)
                    
                except Exception as e:
                    logger.error(f"Error processing frame {frame_count}: {e}")
                    continue
            
            # Cleanup
            cap.release()
            logger.info("Stream processing stopped")
            
        except Exception as e:
            logger.error(f"Stream processing error: {e}")
        finally:
            self.is_running = False

# Global instance
person_counter_service = PersonCounterService() 