import subprocess
import sys
import os
import time
import threading
import webbrowser

def check_dependencies():
    print("🔍 Checking project dependencies...")
    
    if not os.path.exists('PersonCounter.py'):
        print("❌ PersonCounter.py not found!")
        return False
    
    if not os.path.exists('package.json'):
        print("❌ package.json not found! Frontend not detected.")
        return False
    
    if not os.path.exists('node_modules'):
        print("⚠️  node_modules not found. Installing dependencies...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Frontend dependencies installed!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies!")
            return False
    
    return True

def start_frontend():
    print("🌐 Starting CrowdShield Frontend...")
    try:
        frontend_process = subprocess.Popen(['npm', 'run', 'dev'], 
                                         stdout=subprocess.PIPE, 
                                         stderr=subprocess.PIPE)
        print("✅ Frontend started successfully!")
        return frontend_process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def start_backend():
    print("🚀 Starting PersonCounter Backend...")
    try:
        backend_process = subprocess.Popen([sys.executable, 'PersonCounter.py'], 
                                        stdout=subprocess.PIPE, 
                                        stderr=subprocess.PIPE)
        print("✅ Backend started successfully!")
        return backend_process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def open_browser():
    time.sleep(8)
    try:
        webbrowser.open('http://localhost:8080')
        print("🌐 Opening CrowdShield dashboard in browser...")
    except:
        print("💡 Please open http://localhost:8080 in your browser")

def main():
    print("=" * 60)
    print("🚀 CROWDSHIELD - FULL STACK DEPLOYMENT")
    print("=" * 60)
    print("🎯 AI-Powered Crowd Management System")
    print("🔧 Backend: Python + OpenCV + YOLOv8")
    print("🌐 Frontend: React + TypeScript + Vite")
    print("=" * 60)
    
    if not check_dependencies():
        print("❌ Dependency check failed. Exiting...")
        return
    
    backend_process = None
    frontend_process = None
    
    try:
        print("\n🚀 Starting CrowdShield services...")
        
        frontend_process = start_frontend()
        if not frontend_process:
            print("❌ Failed to start frontend. Exiting...")
            return
        
        time.sleep(5)
        
        backend_process = start_backend()
        if not backend_process:
            print("❌ Failed to start backend. Exiting...")
            return
        
        time.sleep(3)
        
        print("\n🎉 CrowdShield is now running!")
        print("=" * 60)
        print("📱 Frontend: http://localhost:8080")
        print("🔧 Backend: PersonCounter.py (AI Processing)")
        print("🎯 Dashboard: http://localhost:8080/dashboard")
        print("=" * 60)
        
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        print("\n⏹️  Press Ctrl+C to stop all services...")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping CrowdShield services...")
        
        if frontend_process:
            print("🛑 Stopping frontend...")
            frontend_process.terminate()
            frontend_process.wait()
        
        if backend_process:
            print("🛑 Stopping backend...")
            backend_process.terminate()
            backend_process.wait()
        
        print("✅ All services stopped!")
        print("👋 CrowdShield shutdown complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
        if frontend_process:
            frontend_process.terminate()
        if backend_process:
            backend_process.terminate()

if __name__ == "__main__":
    main() 