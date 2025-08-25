# 🛡️ CrowdShield - AI-Powered Crowd Management System

<div align="center">

![CrowdShield Banner](https://img.shields.io/badge/CrowdShield-AI%20Powered%20Crowd%20Management-blue?style=for-the-badge&logo=shield-check&logoColor=white)

**🏆 #5 Winner in SUNHACKS 2K25 🏆**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![YOLO](https://img.shields.io/badge/YOLO-v8-00FFFF.svg?style=for-the-badge&logo=yolo&logoColor=black)](https://ultralytics.com)

*A comprehensive crowd management and monitoring system with real-time AI person counting, live webcam streaming, and intelligent alert systems.*

[🚀 Quick Start](#-quick-start) • [📱 Features](#-features) • [🛠️ Tech Stack](#️-technology-stack) • [📁 Project Structure](#-project-structure) • [🔧 Setup](#-setup)

</div>

---

## 🌟 Features

<div align="center">

| 🔴 **Live Monitoring** | 🗺️ **Smart Analytics** | 🚨 **Alert System** | 🔐 **Security** |
|:----------------------:|:----------------------:|:-------------------:|:---------------:|
| Real-time camera feeds | Interactive heatmaps | Email notifications | JWT authentication |
| AI person counting | Crowd density mapping | Audio alerts | OTP verification |
| Multi-zone tracking | Predictive analytics | Emergency protocols | Role-based access |

</div>

### 🎯 **Core Capabilities**
- **🎥 Live Webcam Streaming** - Real-time camera feeds with AI person counting
- **🧠 AI Person Detection** - YOLO-powered real-time person counting
- **📊 Interactive Heatmaps** - Visual crowd density mapping with Mapbox
- **🔔 Smart Alert System** - Automated email notifications and multilingual audio alerts
- **👤 User Authentication** - Secure login with OTP verification
- **💾 Database Integration** - MongoDB for persistent data storage
- **📱 Responsive UI** - Modern, mobile-friendly interface

---

## 🛠️ Technology Stack

<div align="center">

### **Frontend Layer** 🎨
```
┌─────────────────────────────────────────────────────────────┐
│                    🎯 React + TypeScript                   │
├─────────────────────────────────────────────────────────────┤
│  🎨 Tailwind CSS  │  🧩 Shadcn/ui  │  🗺️ Mapbox GL JS   │
└─────────────────────────────────────────────────────────────┘
```

### **Backend Layer** ⚙️
```
┌─────────────────────────────────────────────────────────────┐
│                   🚀 FastAPI + Python                     │
├─────────────────────────────────────────────────────────────┤
│  🗄️ Motor (MongoDB)  │  🔐 JWT + OTP  │  📧 SMTP Email   │
└─────────────────────────────────────────────────────────────┘
```

### **AI/ML Layer** 🤖
```
┌─────────────────────────────────────────────────────────────┐
│                    🧠 YOLO + OpenCV                       │
├─────────────────────────────────────────────────────────────┤
│  👥 Person Detection  │  🔢 Counting  │  📊 Analytics    │
└─────────────────────────────────────────────────────────────┘
```

</div>

---

## 📁 Project Structure

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🏗️ CROWDSHIELD PROJECT ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

📦 crowdshield/
├── 🎯 client/                          # 🚀 React Frontend Application
│   ├── 📱 components/                   # 🧩 Reusable UI Components
│   │   ├── 🗺️ CrowdHeatmap.tsx         # 📊 Interactive Heatmap Component
│   │   ├── 🔐 ProtectedRoute.tsx       # 🛡️ Authentication Guard
│   │   └── 🎨 ui/                      # 🎭 Design System Components
│   │       ├── 📋 accordion.tsx        # 📝 Collapsible Content
│   │       ├── 🚨 alert-dialog.tsx     # ⚠️ Alert Modals
│   │       ├── 🔔 alert.tsx            # 📢 Notification System
│   │       └── ...                     # 🎨 48+ UI Components
│   ├── 🎨 global.css                   # 🌈 Global Styles & Themes
│   ├── 🪝 hooks/                       # 🔗 Custom React Hooks
│   │   ├── 📱 use-mobile.tsx           # 📱 Mobile Detection
│   │   └── 🔔 use-toast.ts             # 🍞 Toast Notifications
│   ├── 🏠 pages/                       # 📄 Application Pages
│   │   ├── 🔐 Auth.tsx                 # 🔑 Authentication Pages
│   │   ├── 📊 Dashboard.tsx            # 🎛️ Main Dashboard
│   │   ├── 🏠 Index.tsx                # 🏠 Landing Page
│   │   └── ...                         # 📄 Additional Pages
│   ├── 🗺️ types/                       # 📝 TypeScript Definitions
│   │   └── 🗺️ mapbox.d.ts              # 🗺️ Mapbox Type Definitions
│   └── 📦 package.json                 # 📋 Frontend Dependencies
│
├── ⚙️ backend/                          # 🐍 Python Backend Services
│   ├── 🎥 live_person_counter.py       # 👥 Real-time Person Counting
│   ├── 🚀 main.py                      # 🚀 FastAPI Application
│   ├── 🧠 object_class.names           # 🏷️ YOLO Class Labels
│   └── 📋 requirements.txt             # 🐍 Python Dependencies
│
├── 🌐 server/                           # 🖥️ Node.js Server Services
│   ├── 📧 emailService.ts              # 📧 Email Service Layer
│   ├── 🚀 index.ts                     # 🚀 Express Server
│   ├── 🔨 node-build.ts                # 🛠️ Build Configuration
│   └── 🛣️ routes/                      # 🛣️ API Route Definitions
│       └── 🎮 demo.ts                  # 🎮 Demo API Routes
│
├── 🔗 shared/                           # 🔗 Shared Utilities
│   └── 🌐 api.ts                       # 🌐 API Client Functions
│
├── 🚀 deploy.py                         # 🚀 Automated Deployment Script
├── 🪟 deploy.bat                        # 🪟 Windows Deployment Script
├── 📋 components.json                   # 🧩 Component Configuration
├── 🌐 netlify.toml                      # 🌐 Netlify Configuration
├── 📁 netlify/functions/               # ⚡ Serverless Functions
│   └── 🌐 api.ts                       # 🌐 Netlify API Functions
├── 🌍 public/                           # 🌍 Static Assets
│   ├── 🎥 *.mp4                        # 🎥 Video Assets
│   ├── 🖼️ favicon.ico                  # 🖼️ Site Icon
│   └── 📄 robots.txt                   # 🤖 SEO Configuration
└── 🐍 venv/                             # 🐍 Python Virtual Environment
    └── 📦 site-packages/               # 📦 Installed Packages
        ├── 🧠 cv2/                     # 🎥 OpenCV Computer Vision
        ├── 🚀 fastapi/                 # 🚀 FastAPI Framework
        ├── 🗄️ motor/                   # 🗄️ MongoDB Driver
        ├── 🧠 ultralytics/             # 🧠 YOLO AI Models
        └── ...                         # 📦 100+ Additional Packages
```

</div>

---

## 🚀 Quick Start

<div align="center">

### **🎯 Choose Your Deployment Method**

| 🪟 **Windows** | 🐧 **Linux/Mac** | 🛠️ **Manual** |
|:---------------:|:----------------:|:---------------:|
| `deploy.bat`    | `python deploy.py` | Step-by-step setup |

</div>

### **⚡ Option 1: Automated Deployment (Recommended)**

<details>
<summary><b>🪟 Windows Users - Click to Expand</b></summary>

```batch
# Double-click deploy.bat or run in PowerShell:
.\deploy.bat
```

</details>

<details>
<summary><b>🐧 Linux/Mac Users - Click to Expand</b></summary>

```bash
# Run the automated deployment script:
python deploy.py
```

</details>

### **🔧 Option 2: Manual Deployment**

<details>
<summary><b>📋 Step-by-Step Setup - Click to Expand</b></summary>

#### **1. 🚀 Clone & Setup**
```bash
git clone <repository-url>
cd crowdshield
```

#### **2. 📦 Install Dependencies**
```bash
# Python dependencies
pip install -r backend/requirements.txt

# Node.js dependencies
cd client
npm install
cd ..
```

#### **3. 🗄️ Start MongoDB**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

#### **4. ⚙️ Start Backend**
```bash
cd backend
uvicorn main:app --reload
```

#### **5. 🎨 Start Frontend**
```bash
cd client
npm run dev
```

#### **6. 🌐 Access Application**
- **🎨 Frontend**: http://localhost:5173
- **⚙️ Backend**: http://localhost:8000

</details>

---

## 📱 Live Webcam Setup

<div align="center">

### **📱 Mobile Camera Integration**

```
┌─────────────────────────────────────────────────────────────────┐
│                    📱 IP WEBCAM SETUP FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│  1. 📱 Install IP Webcam App                                  │
│  2. 🚀 Start Server & Get IP                                  │
│  3. 🔧 Update Stream URL                                      │
│  4. ✅ Test Stream Connection                                  │
└─────────────────────────────────────────────────────────────────┘
```

</div>

### **🔧 Configuration Steps**

1. **📱 Install IP Webcam app** on your phone
2. **🚀 Start the server** and note the IP address
3. **🔧 Update the stream URL** in `client/pages/Dashboard.tsx`:
```typescript
liveStreamUrl: "http://YOUR_PHONE_IP:8080/video"
```
4. **✅ Test the stream** using the "Test Stream" button

### **⚙️ Camera Settings**
- **🎥 Video Format**: MJPEG or H.264
- **📐 Resolution**: 720p or 480p
- **🎬 Frame Rate**: 15-30 fps
- **🔌 Port**: 8080 (default)

---

## 🎯 Usage Guide

<div align="center">

### **🚀 User Journey Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   🔐 Auth   │───▶│  📊 Monitor │───▶│  🚨 Alerts  │───▶│  🗺️ Maps   │
│  Sign Up    │    │ Live Stream │    │  Configure  │    │ Heatmaps   │
│  Sign In    │    │ AI Counting │    │  Thresholds │    │ Safe Routes│
│  OTP Verify │    │ Zone Track  │    │  Auto Email │    │ Navigation │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

</div>


<div align="center">

## 🏆 **SUNHACKS 2K25 - #6 WINNER** 🏆

**CrowdShield** emerged victorious as the **#6 winner** in the prestigious **SUNHACKS 2K25** hackathon, showcasing innovative AI-powered crowd management solutions that impressed judges with its technical excellence and real-world applicability.

---

**Made with ❤️ for better crowd management** 