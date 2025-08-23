#!/usr/bin/env python3
"""
Test script for Live Person Counter
This script demonstrates how to use the LivePersonCounter class with different stream URLs
"""

import time
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from live_person_counter import LivePersonCounter

def test_ip_webcam():
    """Test with IP Webcam stream"""
    print("🧪 Testing with IP Webcam Stream")
    print("=" * 50)
    
    # Create counter with IP Webcam URL
    counter = LivePersonCounter("http://20.20.8.91:8080/video")
    
    try:
        # Start counting
        if counter.start_counting():
            print("✅ IP Webcam counter started successfully")
            
            # Monitor for 60 seconds
            for i in range(60):
                time.sleep(1)
                counts = counter.get_counts()
                print(f"Time: {i+1}s - Entry: {counts['entry']}, Exit: {counts['exit']}, Density: {counts['density']}")
                
                # Stop if no activity for 10 seconds
                if i > 10 and counts['density'] == 0:
                    print("No activity detected, stopping...")
                    break
        
        else:
            print("❌ Failed to start IP Webcam counter")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    
    finally:
        counter.stop_counting()
        print("✅ IP Webcam test completed")

def test_local_camera():
    """Test with local camera (webcam)"""
    print("\n🧪 Testing with Local Camera")
    print("=" * 50)
    
    # Create counter with local camera (usually index 0)
    counter = LivePersonCounter("0")  # Use local webcam
    
    try:
        # Start counting
        if counter.start_counting():
            print("✅ Local camera counter started successfully")
            
            # Monitor for 30 seconds
            for i in range(30):
                time.sleep(1)
                counts = counter.get_counts()
                print(f"Time: {i+1}s - Entry: {counts['entry']}, Exit: {counts['exit']}, Density: {counts['density']}")
        
        else:
            print("❌ Failed to start local camera counter")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    
    finally:
        counter.stop_counting()
        print("✅ Local camera test completed")

def test_rtsp_stream():
    """Test with RTSP stream (if available)"""
    print("\n🧪 Testing with RTSP Stream")
    print("=" * 50)
    
    # Example RTSP URL (replace with your actual RTSP stream)
    rtsp_url = "rtsp://192.168.1.100:554/stream"
    
    print(f"Attempting to connect to: {rtsp_url}")
    print("Note: This will fail if no RTSP stream is available")
    
    counter = LivePersonCounter(rtsp_url)
    
    try:
        # Start counting
        if counter.start_counting():
            print("✅ RTSP counter started successfully")
            
            # Monitor for 30 seconds
            for i in range(30):
                time.sleep(1)
                counts = counter.get_counts()
                print(f"Time: {i+1}s - Entry: {counts['entry']}, Exit: {counts['exit']}, Density: {counts['density']}")
        
        else:
            print("❌ Failed to start RTSP counter (expected if no RTSP stream available)")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    
    finally:
        counter.stop_counting()
        print("✅ RTSP test completed")

def interactive_test():
    """Interactive test with user input"""
    print("\n🎮 Interactive Live Person Counter Test")
    print("=" * 50)
    
    print("Available test options:")
    print("1. IP Webcam Stream (http://20.20.8.91:8080/video)")
    print("2. Local Camera (webcam)")
    print("3. Custom Stream URL")
    print("4. Exit")
    
    while True:
        try:
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == "1":
                test_ip_webcam()
            elif choice == "2":
                test_local_camera()
            elif choice == "3":
                custom_url = input("Enter custom stream URL: ").strip()
                if custom_url:
                    print(f"\n🧪 Testing with Custom URL: {custom_url}")
                    print("=" * 50)
                    
                    counter = LivePersonCounter(custom_url)
                    
                    try:
                        if counter.start_counting():
                            print("✅ Custom stream counter started successfully")
                            
                            # Monitor for 30 seconds
                            for i in range(30):
                                time.sleep(1)
                                counts = counter.get_counts()
                                print(f"Time: {i+1}s - Entry: {counts['entry']}, Exit: {counts['exit']}, Density: {counts['density']}")
                        else:
                            print("❌ Failed to start custom stream counter")
                    
                    except KeyboardInterrupt:
                        print("\n🛑 Interrupted by user")
                    
                    finally:
                        counter.stop_counting()
                        print("✅ Custom stream test completed")
                else:
                    print("❌ Invalid URL")
            elif choice == "4":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1-4.")
        
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Main function"""
    print("🚀 Live Person Counter Test Suite")
    print("=" * 50)
    print("This script tests the LivePersonCounter class with different stream types")
    print("Make sure you have the required dependencies installed:")
    print("- opencv-python")
    print("- ultralytics")
    print("- pandas")
    print("- numpy")
    print("- cvzone")
    print("- tracker.py (from the original PersonCounter.py)")
    print()
    
    # Check if tracker.py exists
    if not os.path.exists('tracker.py'):
        print("⚠️  Warning: tracker.py not found!")
        print("   Make sure you have the tracker.py file from the original PersonCounter.py")
        print("   The live counter may not work without it.")
        print()
    
    # Run interactive test
    interactive_test()

if __name__ == "__main__":
    main() 