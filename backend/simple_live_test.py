#!/usr/bin/env python3
"""
Simple Live Person Counter Test
This script directly tests the live person counter with visual display
"""

import cv2
import time
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from live_person_counter import LivePersonCounter

def main():
    """Main test function"""
    print("🎥 Simple Live Person Counter Test")
    print("=" * 50)
    print("This will show the visual display like the original PersonCounter.py")
    print("Press 'ESC' or 'Q' to stop")
    print()
    
    # Test stream URL
    stream_url = "http://20.20.8.91:8080/video"
    print(f"Testing with stream: {stream_url}")
    print()
    
    # Create counter
    counter = LivePersonCounter(stream_url)
    
    try:
        # Start counting
        print("Starting live person counting...")
        if counter.start_counting():
            print("✅ Live person counting started successfully!")
            print("Look for the 'Live Person Counter' window")
            print("You should see:")
            print("- Green bounding boxes around detected people")
            print("- Magenta tracking IDs above each person")
            print("- Entry/Exit counters in top corners")
            print("- Center line for entry/exit detection")
            print("- Real-time density count")
            print()
            print("Press ESC or Q to stop...")
            
            # Keep running until stopped
            while counter.is_running:
                time.sleep(1)
                
                # Get current counts
                counts = counter.get_counts()
                print(f"Entry: {counts['entry']}, Exit: {counts['exit']}, Density: {counts['density']}")
                
        else:
            print("❌ Failed to start live person counting")
            print("Check if:")
            print("1. IP Webcam is running on your phone")
            print("2. The stream URL is correct")
            print("3. Your computer can access the phone's IP")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        # Stop counting
        print("Stopping live person counting...")
        counter.stop_counting()
        print("✅ Test completed")

if __name__ == "__main__":
    main() 