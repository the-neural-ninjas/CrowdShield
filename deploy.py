#!/usr/bin/env python3
"""
CrowdShield Complete Deployment Script
This script handles the complete deployment of the CrowdShield system:
1. Install dependencies
2. Start MongoDB (if not running)
3. Start FastAPI backend
4. Start React frontend
5. Open browser
"""

import os
import sys
import time
import subprocess
import threading
import signal
import platform
import requests
from pathlib import Path

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class Deployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.client_dir = self.project_root / "client"
        self.backend_dir = self.project_root / "backend"
        self.processes = []
        self.is_windows = platform.system() == "Windows"
        
    def print_header(self, message):
        """Print a formatted header message"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
        print(f"🚀 {message}")
        print(f"{'='*60}{Colors.ENDC}\n")
    
    def print_step(self, message):
        """Print a step message"""
        print(f"{Colors.OKBLUE}📋 {message}{Colors.ENDC}")
    
    def print_success(self, message):
        """Print a success message"""
        print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")
    
    def print_warning(self, message):
        """Print a warning message"""
        print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")
    
    def print_error(self, message):
        """Print an error message"""
        print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")
    
    def run_command(self, command, cwd=None, shell=True, check=True):
        """Run a command and return the result"""
        try:
            if self.is_windows:
                command = command.replace('&&', ';')
            
            result = subprocess.run(
                command,
                cwd=cwd or self.project_root,
                shell=shell,
                check=check,
                capture_output=True,
                text=True
            )
            return result
        except subprocess.CalledProcessError as e:
            self.print_error(f"Command failed: {command}")
            self.print_error(f"Error: {e.stderr}")
            return e
    
    def install_dependencies(self):
        """Install all required dependencies"""
        self.print_header("Installing Dependencies")
        
        # Install Python dependencies
        self.print_step("Installing Python dependencies...")
        result = self.run_command("pip install -r backend/requirements.txt", cwd=self.project_root)
        if result.returncode == 0:
            self.print_success("Python dependencies installed successfully")
        else:
            self.print_warning("Some Python dependencies may have failed to install")
        
        # Install Node.js dependencies
        if self.client_dir.exists():
            self.print_step("Installing Node.js dependencies...")
            result = self.run_command("npm install", cwd=self.client_dir)
            if result.returncode == 0:
                self.print_success("Node.js dependencies installed successfully")
            else:
                self.print_warning("Some Node.js dependencies may have failed to install")
    
    def check_mongodb(self):
        """Check if MongoDB is running"""
        self.print_step("Checking MongoDB status...")
        try:
            # Try to connect to MongoDB
            import motor.motor_asyncio
            client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
            # This will raise an exception if MongoDB is not running
            client.admin.command('ping')
            self.print_success("MongoDB is running")
            return True
        except Exception as e:
            self.print_warning("MongoDB is not running")
            self.print_step("Starting MongoDB...")
            
            if self.is_windows:
                # Try to start MongoDB service on Windows
                result = self.run_command("net start MongoDB", check=False)
                if result.returncode == 0:
                    self.print_success("MongoDB service started")
                    return True
                else:
                    self.print_warning("Could not start MongoDB service. Please start it manually.")
                    return False
            else:
                # Try to start MongoDB on Linux/Mac
                result = self.run_command("sudo systemctl start mongod", check=False)
                if result.returncode == 0:
                    self.print_success("MongoDB started")
                    return True
                else:
                    self.print_warning("Could not start MongoDB. Please start it manually.")
                    return False
    
    def start_backend(self):
        """Start the FastAPI backend"""
        self.print_header("Starting FastAPI Backend")
        
        if not self.backend_dir.exists():
            self.print_error("Backend directory not found!")
            return False
        
        self.print_step("Starting backend server...")
        
        # Start backend in a separate thread
        def run_backend():
            try:
                subprocess.run(
                    ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                    cwd=self.backend_dir,
                    check=True
                )
            except KeyboardInterrupt:
                pass
            except Exception as e:
                self.print_error(f"Backend error: {e}")
        
        backend_thread = threading.Thread(target=run_backend, daemon=True)
        backend_thread.start()
        
        # Wait for backend to start
        self.print_step("Waiting for backend to start...")
        for i in range(30):  # Wait up to 30 seconds
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                if response.status_code == 200:
                    self.print_success("Backend started successfully!")
                    return True
            except:
                pass
            time.sleep(1)
        
        self.print_error("Backend failed to start!")
        return False
    
    def start_frontend(self):
        """Start the React frontend"""
        self.print_header("Starting React Frontend")
        
        if not self.client_dir.exists():
            self.print_error("Client directory not found!")
            return False
        
        self.print_step("Starting frontend development server...")
        
        # Start frontend in a separate thread
        def run_frontend():
            try:
                subprocess.run(
                    ["npm", "run", "dev"],
                    cwd=self.client_dir,
                    check=True
                )
            except KeyboardInterrupt:
                pass
            except Exception as e:
                self.print_error(f"Frontend error: {e}")
        
        frontend_thread = threading.Thread(target=run_frontend, daemon=True)
        frontend_thread.start()
        
        # Wait for frontend to start
        self.print_step("Waiting for frontend to start...")
        for i in range(60):  # Wait up to 60 seconds
            try:
                response = requests.get("http://localhost:5173", timeout=2)
                if response.status_code == 200:
                    self.print_success("Frontend started successfully!")
                    return True
            except:
                pass
            time.sleep(1)
        
        self.print_error("Frontend failed to start!")
        return False
    
    def open_browser(self):
        """Open the application in browser"""
        self.print_step("Opening application in browser...")
        
        import webbrowser
        webbrowser.open("http://localhost:5173")
        self.print_success("Browser opened!")
    
    def cleanup_test_files(self):
        """Remove unnecessary test files"""
        self.print_header("Cleaning Up Test Files")
        
        test_files_to_remove = [
            "backend/test_person_counter.py",
            "backend/test_backend.py",
            "VIDEO_STREAMING_TROUBLESHOOTING.md",
            "LIVE_WEBCAM_AI_SETUP.md",
            "AUTHENTICATION_SETUP.md",
            "MONGODB_SETUP.md",
            "ALERT_SYSTEM_GUIDE.md"
        ]
        
        for file_path in test_files_to_remove:
            full_path = self.project_root / file_path
            if full_path.exists():
                try:
                    full_path.unlink()
                    self.print_success(f"Removed: {file_path}")
                except Exception as e:
                    self.print_warning(f"Could not remove {file_path}: {e}")
    
    def show_status(self):
        """Show the status of all services"""
        self.print_header("Deployment Status")
        
        # Check backend
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                self.print_success("Backend: Running on http://localhost:8000")
            else:
                self.print_error("Backend: Not responding")
        except:
            self.print_error("Backend: Not running")
        
        # Check frontend
        try:
            response = requests.get("http://localhost:5173", timeout=2)
            if response.status_code == 200:
                self.print_success("Frontend: Running on http://localhost:5173")
            else:
                self.print_error("Frontend: Not responding")
        except:
            self.print_error("Frontend: Not running")
        
        # Check MongoDB
        try:
            import motor.motor_asyncio
            client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
            client.admin.command('ping')
            self.print_success("MongoDB: Running on localhost:27017")
        except:
            self.print_error("MongoDB: Not running")
    
    def deploy(self):
        """Main deployment function"""
        self.print_header("CrowdShield Complete Deployment")
        
        try:
            # Step 1: Clean up test files
            self.cleanup_test_files()
            
            # Step 2: Install dependencies
            self.install_dependencies()
            
            # Step 3: Check MongoDB
            if not self.check_mongodb():
                self.print_warning("MongoDB is not running. Please start it manually and run the script again.")
                return False
            
            # Step 4: Start backend
            if not self.start_backend():
                return False
            
            # Step 5: Start frontend
            if not self.start_frontend():
                return False
            
            # Step 6: Open browser
            time.sleep(2)  # Wait a bit for everything to settle
            self.open_browser()
            
            # Step 7: Show status
            time.sleep(3)
            self.show_status()
            
            self.print_header("🎉 Deployment Complete!")
            print(f"{Colors.OKGREEN}Your CrowdShield application is now running!")
            print(f"Frontend: http://localhost:5173")
            print(f"Backend:  http://localhost:8000")
            print(f"Database: localhost:27017")
            print(f"\nPress Ctrl+C to stop all services{Colors.ENDC}")
            
            # Keep the script running
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                self.print_header("Shutting Down Services")
                self.print_success("All services stopped. Goodbye!")
            
        except Exception as e:
            self.print_error(f"Deployment failed: {e}")
            return False

def main():
    """Main entry point"""
    deployer = Deployer()
    deployer.deploy()

if __name__ == "__main__":
    main() 