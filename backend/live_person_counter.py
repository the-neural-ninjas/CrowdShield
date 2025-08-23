import cv2
import pandas as pd
import numpy as np
from ultralytics import YOLO
from tracker import Tracker
import cvzone
import os
import torch
import threading
import time
from typing import Dict, Any, Optional

class LivePersonCounter:
    def __init__(self, stream_url: str = "http://20.20.8.91:8080/video"):
        """
        Initialize the live person counter with a stream URL
        
        Args:
            stream_url: URL of the live camera stream (IP Webcam, RTSP, etc.)
        """
        self.stream_url = stream_url
        self.model = None
        self.tracker = None
        self.cap = None
        self.is_running = False
        self.is_processing = False
        
        # Counters
        self.entry_count = 0
        self.exit_count = 0
        self.density_count = 0
        
        # Tracking
        self.previous_positions = {}
        self.center_line_x = 0
        
        # Threading
        self.processing_thread = None
        
        # Initialize components
        self._initialize_model()
        self._initialize_tracker()
        
    def _initialize_model(self):
        """Initialize YOLO model for person detection"""
        try:
            print("Initializing YOLO model...")
            torch.cuda.is_available = lambda: False  # Force CPU usage
            self.model = YOLO('yolov8s.pt')
            print("✅ YOLO model initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize YOLO model: {e}")
            raise
    
    def _initialize_tracker(self):
        """Initialize the object tracker"""
        try:
            self.tracker = Tracker()
            print("✅ Tracker initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize tracker: {e}")
            raise
    
    def _connect_to_stream(self) -> bool:
        """Connect to the live camera stream"""
        try:
            print(f"Connecting to stream: {self.stream_url}")
            
            # Try different connection methods
            if self.stream_url.startswith('http'):
                # HTTP stream (IP Webcam)
                self.cap = cv2.VideoCapture(self.stream_url)
            elif self.stream_url.startswith('rtsp'):
                # RTSP stream
                self.cap = cv2.VideoCapture(self.stream_url)
            else:
                # Local camera index
                self.cap = cv2.VideoCapture(int(self.stream_url))
            
            if not self.cap.isOpened():
                print(f"❌ Failed to connect to stream: {self.stream_url}")
                return False
            
            # Get video properties
            self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
            
            # Set center line for entry/exit detection
            self.center_line_x = self.width // 2
            
            print(f"✅ Connected to stream: {self.width}x{self.height} @ {self.fps}fps")
            print(f"Center line at x = {self.center_line_x}")
            return True
            
        except Exception as e:
            print(f"❌ Stream connection error: {e}")
            return False
    
    def _load_class_names(self) -> list:
        """Load class names for YOLO detection"""
        try:
            # Try to load from file
            if os.path.exists('object_class.names'):
                with open('object_class.names', 'r') as file:
                    return file.read().split('\n')
            else:
                # Default COCO classes (person is index 0)
                return ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat']
        except Exception as e:
            print(f"Warning: Could not load class names: {e}")
            return ['person']
    
    def _process_frame(self, frame):
        """Process a single frame for person detection and counting"""
        try:
            # Run YOLO detection
            results = self.model.predict(frame, conf=0.5, device='cpu')
            
            if not results or len(results) == 0:
                # Still draw counters even if no detections
                self._draw_counters(frame)
                return frame
            
            a = results[0].boxes.data
            px = pd.DataFrame(a).astype("float")
            
            # Extract person detections
            person_list = []
            for index, row in px.iterrows():
                x1, y1, x2, y2, conf, d = row
                if conf > 0.5:
                    class_name = self._load_class_names()[int(d)] if int(d) < len(self._load_class_names()) else 'person'
                    if 'person' in class_name.lower():
                        person_list.append([int(x1), int(y1), int(x2), int(y2)])
            
            # Update tracker
            bbox_id = self.tracker.update(person_list)
            
            current_positions = {}
            
            # Process each detected person
            for bbox in bbox_id:
                x3, y3, x4, y4, person_id = bbox
                cx = int((x3 + x4) // 2)
                cy = int((y3 + y4) // 2)
                
                current_positions[person_id] = (cx, cy)
                
                # Draw bounding box (green)
                cv2.rectangle(frame, (x3, y3), (x4, y4), (0, 255, 0), 2)
                
                # Draw center point (magenta)
                cv2.circle(frame, (cx, cy), 4, (255, 0, 255), -1)
                
                # Draw person ID (like original)
                cvzone.putTextRect(frame, f'{person_id}', (x3, y3), 1, 2)
                
                # Check for entry/exit
                if person_id in self.previous_positions:
                    prev_x, prev_y = self.previous_positions[person_id]
                    
                    # Entry detection (left to right)
                    if (prev_x < self.center_line_x and cx >= self.center_line_x):
                        self.entry_count += 1
                        print(f"Person {person_id} ENTERED (left to right) - Entry count: {self.entry_count}")
                        
                        # Draw entry indicator (green circle)
                        cv2.circle(frame, (cx, cy), 15, (0, 255, 0), 3)
                        cvzone.putTextRect(frame, 'ENTRY', (cx-30, cy-30), 1, 2, colorR=(0, 255, 0))
                        
                    # Exit detection (right to left)
                    elif (prev_x > self.center_line_x and cx <= self.center_line_x):
                        self.exit_count += 1
                        print(f"Person {person_id} EXITED (right to left) - Exit count: {self.exit_count}")
                        
                        # Draw exit indicator (red circle)
                        cv2.circle(frame, (cx, cy), 15, (0, 0, 255), 3)
                        cvzone.putTextRect(frame, 'EXIT', (cx-30, cy-30), 1, 2, colorR=(0, 0, 255))
            
            # Update previous positions
            self.previous_positions = current_positions.copy()
            
            # Calculate current density
            self.density_count = len(current_positions)
            
            # Draw all overlays
            self._draw_overlays(frame)
            
            return frame
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            # Still draw overlays even if processing fails
            self._draw_overlays(frame)
            return frame
    
    def _draw_overlays(self, frame):
        """Draw all visual overlays on the frame"""
        # Draw center line (white)
        cv2.line(frame, (self.center_line_x, 0), (self.center_line_x, self.height), (255, 255, 255), 3)
        
        # Draw counters
        self._draw_counters(frame)
        
        # Draw FPS
        cv2.putText(frame, f'FPS: {self.fps}', (10, self.height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    
    def _draw_counters(self, frame):
        """Draw counter overlays on the frame"""
        # Entry counter (green, top right)
        cvzone.putTextRect(frame, f'Entry: {self.entry_count}', (245, 25), 2, 2, colorR=(0, 255, 0))
        
        # Exit counter (red, top left)
        cvzone.putTextRect(frame, f'Exit: {self.exit_count}', (25, 25), 2, 2, colorR=(0, 0, 255))
        
        # Frame counter (below exit)
        cvzone.putTextRect(frame, f'Frame: {getattr(self, 'frame_count', 0)}', (15, 80), 1, 1)
        
        # Density counter (below frame)
        cvzone.putTextRect(frame, f'Density: {self.density_count}', (15, 130), 1, 1)
    
    def _processing_loop(self):
        """Main processing loop for live stream"""
        print("🔄 Starting live person counting...")
        self.is_processing = True
        
        frame_count = 0
        start_time = time.time()
        
        # Create named window for better display
        cv2.namedWindow('Live Person Counter', cv2.WINDOW_NORMAL)
        cv2.resizeWindow('Live Person Counter', 800, 600)
        
        while self.is_running and self.cap and self.cap.isOpened():
            try:
                ret, frame = self.cap.read()
                if not ret:
                    print("❌ Failed to read frame from stream")
                    time.sleep(1)
                    continue
                
                frame_count += 1
                self.frame_count = frame_count  # Store for display
                
                # Process the frame
                processed_frame = self._process_frame(frame)
                
                # Display the frame with proper window management
                cv2.imshow('Live Person Counter', processed_frame)
                
                # Print status every 30 frames
                if frame_count % 30 == 0:
                    elapsed_time = time.time() - start_time
                    actual_fps = frame_count / elapsed_time if elapsed_time > 0 else 0
                    print(f"Processed {frame_count} frames - Entry: {self.entry_count}, Exit: {self.exit_count}, Density: {self.density_count}, FPS: {actual_fps:.1f}")
                
                # Check for exit key (ESC) or window close
                key = cv2.waitKey(1) & 0xff
                if key == 27:  # ESC key
                    print("ESC pressed - stopping processing")
                    break
                elif key == ord('q'):  # Q key
                    print("Q pressed - stopping processing")
                    break
                
                # Small delay to control processing rate
                time.sleep(0.01)
                
            except Exception as e:
                print(f"Error in processing loop: {e}")
                time.sleep(1)
        
        self.is_processing = False
        print("🛑 Live person counting stopped")
    
    def start_counting(self, stream_url: Optional[str] = None) -> bool:
        """
        Start live person counting
        
        Args:
            stream_url: Optional stream URL to override the default
            
        Returns:
            bool: True if started successfully, False otherwise
        """
        try:
            if stream_url:
                self.stream_url = stream_url
            
            # Connect to stream
            if not self._connect_to_stream():
                return False
            
            # Start processing
            self.is_running = True
            self.processing_thread = threading.Thread(target=self._processing_loop, daemon=True)
            self.processing_thread.start()
            
            print(f"✅ Live person counting started for: {self.stream_url}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start live person counting: {e}")
            return False
    
    def stop_counting(self):
        """Stop live person counting"""
        try:
            print("🛑 Stopping live person counting...")
            self.is_running = False
            
            # Wait for processing thread to finish
            if self.processing_thread and self.processing_thread.is_alive():
                self.processing_thread.join(timeout=5)
            
            # Release resources
            if self.cap:
                self.cap.release()
            
            cv2.destroyAllWindows()
            
            print("✅ Live person counting stopped")
            
        except Exception as e:
            print(f"❌ Error stopping live person counting: {e}")
    
    def get_counts(self) -> Dict[str, int]:
        """Get current counts"""
        return {
            'entry': self.entry_count,
            'exit': self.exit_count,
            'density': self.density_count
        }
    
    def reset_counts(self):
        """Reset all counters"""
        self.entry_count = 0
        self.exit_count = 0
        self.density_count = 0
        self.previous_positions = {}
        print("🔄 Counters reset")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status"""
        return {
            'is_running': self.is_running,
            'is_processing': self.is_processing,
            'stream_url': self.stream_url,
            'counts': self.get_counts(),
            'video_properties': {
                'width': getattr(self, 'width', 0),
                'height': getattr(self, 'height', 0),
                'fps': getattr(self, 'fps', 0)
            }
        }

# Example usage and testing
def test_live_person_counter():
    """Test function for live person counter"""
    print("🧪 Testing Live Person Counter")
    
    # Create counter instance
    counter = LivePersonCounter("http://20.20.8.91:8080/video")
    
    try:
        # Start counting
        if counter.start_counting():
            print("✅ Counter started successfully")
            
            # Run for 30 seconds
            print("Running for 30 seconds...")
            time.sleep(30)
            
            # Get final counts
            counts = counter.get_counts()
            print(f"Final counts: {counts}")
            
        else:
            print("❌ Failed to start counter")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    
    finally:
        # Stop counting
        counter.stop_counting()

if __name__ == "__main__":
    test_live_person_counter() 