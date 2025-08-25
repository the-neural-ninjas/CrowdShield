#!/usr/bin/env python3
"""
Frontend Deployment Troubleshooting Script
This script helps diagnose and fix common issues with React frontend deployment
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class FrontendTroubleshooter:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.client_dir = self.project_root / "client"
        
    def print_step(self, message):
        print(f"{Colors.OKBLUE}📋 {message}{Colors.ENDC}")
    
    def print_success(self, message):
        print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")
    
    def print_warning(self, message):
        print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")
    
    def print_error(self, message):
        print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")
    
    def run_command(self, command, cwd=None, timeout=30):
        """Run a command and return the result"""
        try:
            result = subprocess.run(
                command,
                cwd=cwd or self.client_dir,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return result
        except subprocess.TimeoutExpired:
            self.print_error(f"Command timed out: {command}")
            return None
        except Exception as e:
            self.print_error(f"Command failed: {e}")
            return None
    
    def check_directory_structure(self):
        """Check if client directory and files exist"""
        self.print_step("Checking directory structure...")
        
        if not self.client_dir.exists():
            self.print_error("Client directory does not exist!")
            self.print_step("Creating client directory...")
            self.client_dir.mkdir(exist_ok=True)
            return False
        
        package_json =  "package.json"
        if not package_json.exists():
            self.print_error("package.json not found in client directory!")
            return False
        
        self.print_success("Client directory structure looks good")
        return True
    
    def check_package_json(self):
        """Check package.json for dev script"""
        self.print_step("Checking package.json...")
        
        package_json_path =  "package.json"
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            scripts = package_data.get('scripts', {})
            if 'dev' not in scripts:
                self.print_error("No 'dev' script found in package.json")
                self.print_step("Available scripts:")
                for script_name, script_cmd in scripts.items():
                    print(f"  - {script_name}: {script_cmd}")
                return False
            
            self.print_success(f"Dev script found: {scripts['dev']}")
            return True
            
        except Exception as e:
            self.print_error(f"Error reading package.json: {e}")
            return False
    
    def check_node_npm(self):
        """Check if Node.js and npm are installed"""
        self.print_step("Checking Node.js and npm installation...")
        
        # Check Node.js
        node_result = self.run_command("node --version", cwd=self.project_root)
        if node_result and node_result.returncode == 0:
            self.print_success(f"Node.js version: {node_result.stdout.strip()}")
        else:
            self.print_error("Node.js is not installed or not in PATH")
            return False
        
        # Check npm
        npm_result = self.run_command("npm --version", cwd=self.project_root)
        if npm_result and npm_result.returncode == 0:
            self.print_success(f"npm version: {npm_result.stdout.strip()}")
        else:
            self.print_error("npm is not installed or not in PATH")
            return False
        
        return True
    
    def check_dependencies(self):
        """Check if node_modules exists and dependencies are installed"""
        self.print_step("Checking dependencies...")
        
        node_modules =  "node_modules"
        if not node_modules.exists():
            self.print_warning("node_modules directory not found")
            self.print_step("Running npm install...")
            
            install_result = self.run_command("npm install", timeout=120)
            if install_result and install_result.returncode == 0:
                self.print_success("Dependencies installed successfully")
                return True
            else:
                self.print_error("Failed to install dependencies")
                if install_result:
                    print(f"Error output: {install_result.stderr}")
                return False
        
        self.print_success("node_modules directory exists")
        return True
    
    def test_dev_command(self):
        """Test if npm run dev works"""
        self.print_step("Testing npm run dev command...")
        
        # Try to start dev server (but kill it quickly)
        try:
            process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=self.client_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a few seconds to see if it starts
            import time
            time.sleep(5)
            
            if process.poll() is None:  # Process is still running
                self.print_success("npm run dev started successfully")
                process.terminate()
                process.wait()
                return True
            else:
                stdout, stderr = process.communicate()
                self.print_error("npm run dev failed to start")
                print(f"stdout: {stdout}")
                print(f"stderr: {stderr}")
                return False
                
        except Exception as e:
            self.print_error(f"Error testing dev command: {e}")
            return False
    
    def create_basic_react_app(self):
        """Create a basic React app if none exists"""
        self.print_step("Creating basic React app structure...")
        
        # Create basic package.json
        package_json_content = {
            "name": "crowdshield-frontend",
            "version": "0.1.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.66",
                "@types/react-dom": "^18.2.22",
                "@vitejs/plugin-react": "^4.2.1",
                "vite": "^5.2.0"
            }
        }
        
        package_json_path = "package.json"
        with open(package_json_path, 'w') as f:
            json.dump(package_json_content, f, indent=2)
        
        # Create vite.config.js
        vite_config = '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
'''
        
        vite_config_path =  "vite.config.js"
        with open(vite_config_path, 'w') as f:
            f.write(vite_config)
        
        # Create index.html
        index_html = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CrowdShield</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'''
        
        index_html_path =  "index.html"
        with open(index_html_path, 'w') as f:
            f.write(index_html)
        
        # Create src directory and files
        src_dir =  "src"
        src_dir.mkdir(exist_ok=True)
        
        # Create main.jsx
        main_jsx = '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
'''
        
        main_jsx_path = src_dir / "main.jsx"
        with open(main_jsx_path, 'w') as f:
            f.write(main_jsx)
        
        # Create App.jsx
        app_jsx = '''import React from 'react'

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🛡️ CrowdShield</h1>
      <p>AI-Powered Crowd Monitoring System</p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        border: '2px solid #4CAF50',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff'
      }}>
        <p><strong>Frontend Status:</strong> ✅ Running Successfully</p>
        <p><strong>Backend Status:</strong> Check http://localhost:8000</p>
      </div>
    </div>
  )
}

export default App
'''
        
        app_jsx_path = src_dir / "App.jsx"
        with open(app_jsx_path, 'w') as f:
            f.write(app_jsx)
        
        self.print_success("Basic React app structure created")
    
    def run_troubleshooting(self):
        """Run complete troubleshooting sequence"""
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}")
        print("🔍 Frontend Deployment Troubleshooting")
        print(f"{'='*60}{Colors.ENDC}\n")
        
        # Check Node.js and npm
        if not self.check_node_npm():
            self.print_error("Please install Node.js and npm first")
            return False
        
        # Check directory structure
        if not self.check_directory_structure():
            self.print_step("Setting up basic React app...")
            self.create_basic_react_app()
        
        # Check package.json
        if not self.check_package_json():
            self.print_step("Creating proper package.json...")
            self.create_basic_react_app()
        
        # Check dependencies
        if not self.check_dependencies():
            return False
        
        # Test dev command
        if not self.test_dev_command():
            return False
        
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✅ Frontend troubleshooting complete!")
        print(f"You should now be able to run: npm run dev{Colors.ENDC}\n")
        
        return True

def main():
    troubleshooter = FrontendTroubleshooter()
    troubleshooter.run_troubleshooting()

if __name__ == "__main__":
    main()