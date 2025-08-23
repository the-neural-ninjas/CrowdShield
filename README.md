# 🛡️ CrowdShield - AI-Powered Crowd Management System

A comprehensive crowd management and monitoring system with real-time AI person counting, live webcam streaming, and intelligent alert systems.

## 🚀 Features

- **Live Webcam Streaming** - Real-time camera feeds with AI person counting
- **Interactive Heatmaps** - Visual crowd density mapping with Mapbox
- **AI Person Detection** - YOLO-powered real-time person counting
- **Smart Alert System** - Automated email notifications and multilingual audio alerts
- **User Authentication** - Secure login with OTP verification
- **Database Integration** - MongoDB for persistent data storage
- **Responsive UI** - Modern, mobile-friendly interface

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: FastAPI + Python + Motor (MongoDB)
- **AI/ML**: YOLO (Ultralytics) + OpenCV
- **Database**: MongoDB
- **Authentication**: JWT + OTP
- **Maps**: Mapbox GL JS
- **Email**: SMTP (Gmail)

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- Git

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

**Windows:**
```bash
# Double-click deploy.bat or run:
deploy.bat
```

**Linux/Mac:**
```bash
python deploy.py
```

### Option 2: Manual Deployment

1. **Clone the repository**
```bash
git clone <repository-url>
cd crowdshield
```

2. **Install dependencies**
```bash
# Python dependencies
pip install -r backend/requirements.txt

# Node.js dependencies
cd client
npm install
cd ..
```

3. **Start MongoDB**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

4. **Start the backend**
```bash
cd backend
uvicorn main:app --reload
```

5. **Start the frontend**
```bash
cd client
npm run dev
```

6. **Open the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 📱 Live Webcam Setup

1. **Install IP Webcam app** on your phone
2. **Start the server** and note the IP address
3. **Update the stream URL** in `client/pages/Dashboard.tsx`:
```typescript
liveStreamUrl: "http://YOUR_PHONE_IP:8080/video"
```
4. **Test the stream** using the "Test Stream" button

## 🔧 Configuration

### Environment Variables

Create `.env` file in the `backend` directory:

```env
# Email Configuration
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=crowdshield_db

# JWT Configuration
SECRET_KEY=your-secret-key-here
```

### IP Camera Settings

- **Video Format**: MJPEG or H.264
- **Resolution**: 720p or 480p
- **Frame Rate**: 15-30 fps
- **Port**: 8080 (default)

## 🎯 Usage

### 1. **Authentication**
- Sign up with email and employee ID
- Verify email with OTP
- Login to access dashboard

### 2. **Live Monitoring**
- View real-time camera feeds
- Monitor crowd density across zones
- Start AI person counting on live streams

### 3. **Alert Management**
- Configure alert thresholds
- Send automated email notifications
- Play multilingual audio alerts

### 4. **Map Integration**
- View interactive heatmaps
- Track alert locations
- Navigate safe routes

## 🔍 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/verify-otp` - OTP verification
- `GET /api/me` - Get current user

### Person Counting
- `POST /api/start-person-counting` - Start AI counting
- `POST /api/stop-person-counting` - Stop AI counting
- `GET /api/person-counting-status` - Get counting status

### Alerts
- `POST /api/send-alert-to-all-users` - Send mass alerts
- `GET /api/users/emails` - Get user emails

## 🐛 Troubleshooting

### Video Streaming Issues
- Check if phone and computer are on same network
- Verify IP address is correct
- Try different stream endpoints (`/video`, `/mjpeg`, `/shot.jpg`)
- Use the "Test Stream" button for debugging

### Backend Issues
- Ensure MongoDB is running
- Check if all dependencies are installed
- Verify environment variables are set correctly

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Ensure Node.js dependencies are installed

## 📁 Project Structure

```
crowdshield/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app
│   └── package.json
├── backend/               # FastAPI backend
│   ├── main.py           # Main API
│   ├── person_counter_service.py  # AI service
│   └── requirements.txt
├── public/               # Static assets
├── deploy.py            # Deployment script
├── deploy.bat           # Windows deployment
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Test individual components
4. Create an issue with detailed information

---

**Made with ❤️ for better crowd management** 