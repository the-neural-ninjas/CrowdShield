import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CrowdHeatmap from "@/components/CrowdHeatmap";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Camera,
  Activity,
  MapPin,
  Phone,
  Volume2,
  Zap,
  TrendingUp,
  Clock,
  Play,
  Pause,
  Square,
  Maximize,
  Volume1,
  Settings,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  Eye,
  Wifi,
  Signal,
  Battery,
  BarChart3,
  Target,
  Gauge,
  Heart,
  Brain,
  Cpu,
  Database,
  Server,
  Globe,
  Satellite,
  Radar,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  QrCode,
  Scan,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Projector,
  Speaker,
  Headphones,
  Video,
  Film,
  Antenna,
  Building,
  Factory,
  Warehouse,
  Store,
  Theater,
  Library,
  School,
  University,
  Hospital,
  Home,
  Hotel,
  Mountain,
  Cloud,
  Sun,
  Moon,
  Star,
  Crown,
  Gem,
  Diamond,
  Atom,
  Dna,
  Microscope,
  Telescope,
  Binoculars,
  Search,
  Filter,
  List,
  Grid,
  Columns,
  Rows,
  Layout,
  Palette,
  Brush,
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Scissors,
  Paperclip,
  Folder,
  File,
  Image,
  Album,
  Presentation,
  BarChart,
  AreaChart,
  Network,
  Trees,
  Route,
  Milestone,
  Goal,
  Calendar,
  Timer,
  Hourglass,
  Mail,
  Send,
  Bell,
  Megaphone,
  Languages,
  VolumeX,
  Volume2 as Volume2Icon,
  LogOut,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCamera, setSelectedCamera] = useState<typeof activeFeeds[0] | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [streamMethod, setStreamMethod] = useState('mjpeg'); // mjpeg, video, image
  const [imageRefreshInterval, setImageRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Alert System State
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      zone: "Gate 3 Entry",
      message: "Crowd density at 89% - Approaching safety threshold",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: "Medium",
      coordinates: [73.67058268174448, 19.96653781496715],
      emailSent: false,
      audioPlaying: false
    },
    {
      id: 2,
      type: "danger",
      zone: "Main Pavilion",
      message: "Critical congestion detected - Immediate action required",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: "High",
      coordinates: [73.66875109438006, 19.96543260800829],
      emailSent: false,
      audioPlaying: false
    }
  ]);
  
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Database-driven user emails for alert notifications
  const [userEmails, setUserEmails] = useState<Array<{
    email: string;
    name: string;
    employeeId: string;
  }>>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Custom map integration state
  const [showCustomMap, setShowCustomMap] = useState(false);
  const [selectedAlertForMap, setSelectedAlertForMap] = useState<any>(null);

  // Person Counting State
  const [personCounts, setPersonCounts] = useState({
    entry: 0,
    exit: 0,
    density: 0
  });
  const [isCountingActive, setIsCountingActive] = useState(false);
  const [countingStatus, setCountingStatus] = useState('idle'); // idle, processing, error

  // Multilingual alert messages
  const alertMessages = {
    english: {
      warning: "Warning: High crowd density detected. Please proceed with caution.",
      danger: "Emergency: Critical congestion detected. Immediate evacuation required.",
      instruction: "Please follow designated safe routes and maintain social distance."
    },
    hindi: {
      warning: "चेतावनी: उच्च भीड़ घनत्व का पता चला है। कृपया सावधानी से आगे बढ़ें।",
      danger: "आपातकाल: गंभीर भीड़ का पता चला है। तत्काल निकासी आवश्यक है।",
      instruction: "कृपया निर्दिष्ट सुरक्षित मार्गों का पालन करें और सामाजिक दूरी बनाए रखें।"
    },
    marathi: {
      warning: "चेतावणी: उच्च गर्दी घनता आढळली. कृपया सावधानीने पुढे जा.",
      danger: "आणीबाणी: गंभीर गर्दी आढळली. त्वरित सुटका आवश्यक आहे.",
      instruction: "कृपया नियુक्त केलेल्या सुरक्षित मार्गांचे अनुसरण करा आणि सामाजिक अंतर राखा."
    },
    gujarati: {
      warning: "ચેતવણી: ઉચ્ચ ભીડ ઘનતા મળી. કૃપા કરી સાવધાનીથી આગળ વધો.",
      danger: "કટોકટી: ગંભીર ભીડ મળી. તાત્કાલિક નિકાસ જરૂરી છે.",
      instruction: "કૃપા કરી નિયુક્ત સલામત માર્ગોનું પાલન કરો અને સામાજિક અંતર જાળવો."
    }
  };

  const zoneData = [
    { name: "Zone 1", capacity: 10000, current: 9240, status: "critical" },
    { name: "Zone 2", capacity: 5000, current: 4450, status: "warning" },
    { name: "Zone 3", capacity: 3000, current: 1850, status: "normal" },
    { name: "Zone 4", capacity: 4000, current: 2100, status: "normal" },
  ];

  const activeFeeds = [
    {
      id: 1,
      name: "Zone 1",
      zone: "O Building",
      status: "Live",
      type: "Live Webcam",
      resolution: "Live Stream",
      lastUpdate: "Live",
      crowdCount: 9240,
      videoFile: "/zone1.mp4",
      baseUrl: "http://10.110.174.215:8080/",
      isLiveStream: true
    },
    {
      id: 2,
      name: "Zone 2",
      zone: "Olive",
      status: "Live",
      type: "CCTV",
      resolution: "1080p HD",
      lastUpdate: "1 second ago",
      crowdCount: 4450,
      videoFile: "/zone2.mp4",
      isLiveStream: false
    },
    {
      id: 3,
      name: "Zone 3",
      zone: "O'S Link",
      status: "Live",
      type: "CCTV",
      resolution: "4K Ultra HD",
      lastUpdate: "3 seconds ago",
      crowdCount: 1850,
      videoFile: "/zone3.mp4",
      isLiveStream: false
    },
    {
      id: 4,
      name: "Zone 4",
      zone: "S Building Amphithreatre",
      status: "Live",
      type: "CCTV",
      resolution: "720p HD",
      lastUpdate: "5 minutes ago",
      crowdCount: 0,
      videoFile: "/zone4.mp4",
      isLiveStream: false
    },
  ];

  // Fetch user emails from database
  const fetchUserEmails = async () => {
    try {
      setIsLoadingEmails(true);
      const response = await fetch('http://localhost:8000/api/users/emails');
      const data = await response.json();
      
      if (data.success) {
        setUserEmails(data.users);
        console.log(`✅ Fetched ${data.count} user emails from database`);
      } else {
        console.error('Failed to fetch user emails:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user emails:', error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Send alert to all users in database
  const sendAlertToAllUsers = async (alert: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/send-alert-to-all-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: alert.type,
          zone: alert.zone,
          message: alert.message,
          level: alert.level,
          timestamp: alert.timestamp.toISOString(),
          coordinates: alert.coordinates
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update alert to mark email as sent
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, emailSent: true } : a
        ));

        // Show success message
        alert(`Alert sent successfully to ${result.sent_count} users!`);
        console.log('Alert sent to all users:', result);
        
        // Show failed emails if any
        if (result.failed_count > 0) {
          console.warn(`${result.failed_count} emails failed to send:`, result.failed_emails);
        }
      } else {
        throw new Error(result.message || 'Failed to send alert to users');
      }
      
    } catch (error) {
      console.error('Failed to send alert to all users:', error);
      alert(`Failed to send alert: ${error.message}`);
    }
  };

  // Load user emails when component mounts
  useEffect(() => {
    fetchUserEmails();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes === 0) return "Just now";
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  // Function to try different stream methods
  const tryStreamMethod = async (camera: typeof activeFeeds[0], method: string) => {
    setVideoError(null);
    setIsVideoLoading(true);
    setStreamMethod(method);

    const baseUrl = camera.baseUrl;
    
    try {
      switch (method) {
        case 'mjpeg':
          // MJPEG stream - most reliable for IP Webcam
          if (videoRef.current) {
            videoRef.current.src = `${baseUrl}/video`;
            await videoRef.current.load();
            await videoRef.current.play();
          }
          break;
          
        case 'video':
          // MP4 video stream
          if (videoRef.current) {
            videoRef.current.src = `${baseUrl}/videofeed`;
            await videoRef.current.load();
            await videoRef.current.play();
          }
          break;
          
        case 'image':
          // Image refresh method
          startImageRefresh(camera);
          break;
          
        default:
          throw new Error('Unknown stream method');
      }
      
      setIsVideoLoading(false);
      console.log(`✅ Successfully connected using ${method} method`);
      
    } catch (error) {
      console.error(`❌ ${method} method failed:`, error);
      setIsVideoLoading(false);
      
      // Try next method automatically
      if (method === 'mjpeg') {
        setTimeout(() => tryStreamMethod(camera, 'video'), 1000);
      } else if (method === 'video') {
        setTimeout(() => tryStreamMethod(camera, 'image'), 1000);
      } else {
        setVideoError(`All streaming methods failed. Please check if IP Webcam is running on ${baseUrl}`);
      }
    }
  };

  const startImageRefresh = (camera: typeof activeFeeds[0]) => {
    const baseUrl = camera.baseUrl;
    
    // Clear any existing interval
    if (imageRefreshInterval) {
      clearInterval(imageRefreshInterval);
    }
    
    // Function to update image
    const updateImage = () => {
      if (imgRef.current) {
        // Add timestamp to prevent caching
        imgRef.current.src = `${baseUrl}/shot.jpg?t=${Date.now()}`;
      }
    };
    
    // Initial load
    updateImage();
    
    // Set up refresh interval (1 FPS)
    const interval = setInterval(updateImage, 1000);
    setImageRefreshInterval(interval);
    setIsVideoLoading(false);
  };

  const openCameraFeed = (feed: typeof activeFeeds[0]) => {
      setSelectedCamera(feed);
      setCameraModalOpen(true);
    setVideoError(null);
    setIsVideoLoading(true);
    
    // Start with MJPEG method (most reliable for IP Webcam)
    setTimeout(() => tryStreamMethod(feed, 'mjpeg'), 500);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(null);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError('Failed to load video. Please check if the video file exists.');
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  };

  const handleModalClose = () => {
    setCameraModalOpen(false);
    setSelectedCamera(null);
    setVideoError(null);
    setIsVideoLoading(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Clean up image refresh interval
    if (imageRefreshInterval) {
      clearInterval(imageRefreshInterval);
      setImageRefreshInterval(null);
    }
  };

  // Alert System Functions
  const sendAlertEmail = async (alert: any) => {
    try {
      const response = await fetch('/api/send-alert-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert: {
            ...alert,
            timestamp: alert.timestamp.toISOString()
          },
          recipientEmails: userEmails.map(user => user.email) // Use userEmails from state
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update alert to mark email as sent
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, emailSent: true } : a
        ));

        // Show success message
        alert(`Alert email sent successfully to ${userEmails.length} users!`);
        console.log('Email sent successfully:', result.messageId);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('Failed to send alert email:', error);
      alert(`Failed to send alert email: ${error.message}`);
    }
  };

  const playAlertAudio = (alert: any) => {
    try {
      const message = alert.type === 'danger' 
        ? alertMessages[selectedLanguage as keyof typeof alertMessages].danger
        : alertMessages[selectedLanguage as keyof typeof alertMessages].warning;
      
      const instruction = alertMessages[selectedLanguage as keyof typeof alertMessages].instruction;
      
      // Create audio context for text-to-speech
      if ('speechSynthesis' in window) {
        // Stop any currently playing audio
        window.speechSynthesis.cancel();
        
        // Create speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(`${message}. ${instruction}`);
        utterance.volume = audioVolume;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // Set language based on selection
        const languageMap = {
          english: 'en-US',
          hindi: 'hi-IN',
          marathi: 'mr-IN',
          gujarati: 'gu-IN'
        };
        
        utterance.lang = languageMap[selectedLanguage as keyof typeof languageMap] || 'en-US';
        
        // Play the audio
        window.speechSynthesis.speak(utterance);
        setIsAudioPlaying(true);
        
        // Update alert to mark audio as playing
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, audioPlaying: true } : a
        ));
        
        // Stop audio after completion
        utterance.onend = () => {
          setIsAudioPlaying(false);
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? { ...a, audioPlaying: false } : a
          ));
        };
        
      } else {
        alert('Text-to-speech not supported in this browser.');
      }
    } catch (error) {
      console.error('Failed to play alert audio:', error);
      alert('Failed to play alert audio. Please try again.');
    }
  };

  const stopAlertAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setAlerts(prev => prev.map(a => ({ ...a, audioPlaying: false })));
    }
  };

  const addNewAlert = (zone: string, type: 'warning' | 'danger', message: string) => {
    const newAlert = {
      id: Date.now(),
      type,
      zone,
      message,
      timestamp: new Date(),
      level: type === 'danger' ? 'High' : 'Medium',
      coordinates: [73.67058268174448, 19.96653781496715], // Default coordinates
      emailSent: false,
      audioPlaying: false
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    
    // Automatically send email and play audio for new alerts
    setTimeout(() => {
      sendAlertEmail(newAlert);
      playAlertAudio(newAlert);
    }, 1000);
  };

  const clearAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const testEmailService = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Test email sent successfully! Check your inbox.');
        console.log('Test email sent:', result.messageId);
      } else {
        throw new Error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert(`Failed to send test email: ${error.message}`);
    }
  };

  // Person Counting Functions
  const startPersonCounting = async () => {
    try {
      setIsCountingActive(true);
      setCountingStatus('processing');
      
      // Start the AI person counting process
      const response = await fetch('http://localhost:8000/api/start-person-counting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamUrl: selectedCamera?.baseUrl,
          zone: selectedCamera?.zone
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCountingStatus('processing');
        console.log('AI Person Counting started:', result);
        
        // Start polling for results
        startCountingPolling();
      } else {
        throw new Error(result.message || 'Failed to start person counting');
      }
      
    } catch (error) {
      console.error('Failed to start person counting:', error);
      setCountingStatus('error');
      alert(`Failed to start AI counting: ${error.message}`);
    } finally {
      setIsCountingActive(false);
    }
  };

  const startCountingPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/person-counting-status');
        const result = await response.json();
        
        if (result.success) {
          setPersonCounts({
            entry: result.counts.entry || 0,
            exit: result.counts.exit || 0,
            density: result.counts.density || 0
          });
          
          // Update the UI elements
          updateCountingUI(result.counts);
          
          if (result.status === 'completed' || result.status === 'error') {
            clearInterval(pollInterval);
            setIsCountingActive(false);
            setCountingStatus(result.status);
          }
        }
      } catch (error) {
        console.error('Error polling counting status:', error);
      }
    }, 1000); // Poll every second
    
    // Store interval ID for cleanup
    return pollInterval;
  };

  const updateCountingUI = (counts: any) => {
    // Update the DOM elements directly for real-time display
    const entryElement = document.getElementById('entry-count');
    const exitElement = document.getElementById('exit-count');
    const densityElement = document.getElementById('density-count');
    
    if (entryElement) entryElement.textContent = counts.entry || 0;
    if (exitElement) exitElement.textContent = counts.exit || 0;
    if (densityElement) densityElement.textContent = counts.density || 0;
  };

  const stopPersonCounting = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stop-person-counting', {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        setIsCountingActive(false);
        setCountingStatus('idle');
        console.log('AI Person Counting stopped:', result);
      }
    } catch (error) {
      console.error('Failed to stop person counting:', error);
    }
  };

  // Test stream connection
  const testStreamConnection = async () => {
    if (!selectedCamera?.baseUrl) return;
    
    const baseUrl = selectedCamera.baseUrl;
    console.log('Testing stream connection to:', baseUrl);
    
    const endpoints = [
      `${baseUrl}/video`,           // MJPEG stream
      `${baseUrl}/videofeed`,       // MP4 stream
      `${baseUrl}/shot.jpg`,        // Single image
      `${baseUrl}/`,                // Base URL
      `${baseUrl}/settings`,        // Settings page (to check if IP Webcam is running)
    ];
    
    let results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        results.push(`✅ ${endpoint} - Accessible`);
      } catch (error) {
        results.push(`❌ ${endpoint} - ${error.message}`);
      }
    }
    
    alert(`Stream Connection Test Results:\n\n${results.join('\n')}\n\nCheck browser console for detailed logs.`);
    console.log('Stream test results:', results);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                CrowdShield
              </span>
              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse">
                <Satellite className="h-3 w-3 mr-1 animate-spin" />
                Sandip University Nashik
              </Badge>
          </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
                <div className="text-xs sm:text-sm text-blue-200 hidden sm:block animate-fade-in">
                  {formatDate(currentTime)}
            </div>
                <div className="text-sm sm:text-lg font-mono text-white bg-black/20 px-2 py-1 rounded animate-pulse">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                  {formatTime(currentTime)}
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105" onClick={handleLogout}>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Capacity</CardTitle>
              <div className="relative">
                <Users className="h-4 w-4 text-blue-500 group-hover:animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {zoneData.reduce((sum, zone) => sum + zone.capacity, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Maximum venue capacity</p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Current Crowd</CardTitle>
              <div className="relative">
                <Activity className="h-4 w-4 text-green-500 group-hover:animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {zoneData.reduce((sum, zone) => sum + zone.current, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Real-time occupancy</p>
              <div className="mt-2 w-full bg-green-200 rounded-full h-1">
                <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Utilization</CardTitle>
              <div className="relative">
                <TrendingUp className="h-4 w-4 text-purple-500 group-hover:animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round((zoneData.reduce((sum, zone) => sum + zone.current, 0) / zoneData.reduce((sum, zone) => sum + zone.capacity, 0)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall venue usage</p>
              <div className="mt-2 w-full bg-purple-200 rounded-full h-1">
                <div className="bg-purple-600 h-1 rounded-full animate-pulse" style={{width: `${Math.round((zoneData.reduce((sum, zone) => sum + zone.current, 0) / zoneData.reduce((sum, zone) => sum + zone.capacity, 0)) * 100)}%`}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Active Alerts</CardTitle>
              <div className="relative">
                <AlertTriangle className="h-4 w-4 text-red-500 group-hover:animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">Current warnings</p>
              <div className="mt-2 w-full bg-red-200 rounded-full h-1">
                <div className="bg-red-600 h-1 rounded-full animate-pulse" style={{width: `${(alerts.length / 5) * 100}%`}}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-1 rounded-lg">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="cameras" className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Camera Feeds
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Zone Status Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                  Zone Status Overview
                  </CardTitle>
                  <CardDescription>
                  Real-time crowd density across all venue zones
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {zoneData.map((zone) => (
                    <Card key={zone.name} className={`p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 group ${
                      zone.status === 'critical' 
                        ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 hover:shadow-red-500/25' 
                        : zone.status === 'warning' 
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:shadow-yellow-500/25' 
                        : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:shadow-green-500/25'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                          <Building className={`h-4 w-4 ${
                            zone.status === 'critical' ? 'text-red-500' : 
                            zone.status === 'warning' ? 'text-yellow-500' : 'text-green-500'
                          } group-hover:animate-bounce`} />
                          {zone.name}
                        </h4>
                        <Badge 
                          variant={zone.status === 'critical' ? 'destructive' : zone.status === 'warning' ? 'secondary' : 'default'}
                          className={`text-xs ${
                            zone.status === 'critical' ? 'bg-red-500 text-white' : 
                            zone.status === 'warning' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                          } animate-pulse`}
                        >
                          {zone.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Capacity:
                          </span>
                          <span className="font-medium">{zone.capacity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Current:
                          </span>
                          <span className="font-medium">{zone.current.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              Utilization:
                            </span>
                            <span className="font-medium">{Math.round((zone.current / zone.capacity) * 100)}%</span>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={(zone.current / zone.capacity) * 100} 
                              className={`h-2 ${
                                zone.status === 'critical' ? 'bg-red-200' : 
                                zone.status === 'warning' ? 'bg-yellow-200' : 'bg-green-200'
                              }`}
                            />
                            <div className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${
                              zone.status === 'critical' ? 'bg-red-500' : 
                              zone.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} style={{width: `${(zone.current / zone.capacity) * 100}%`}}></div>
                          </div>
                          </div>
                      </div>
              </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <CrowdHeatmap />
          </TabsContent>

          <TabsContent value="cameras" className="space-y-4">
            {/* Camera Feeds */}
            <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Camera className="h-5 w-5 text-purple-500 animate-pulse" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Live Camera Feeds
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Real-time monitoring from CCTV and drone cameras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {activeFeeds.map((feed) => (
                    <Card key={feed.id} className={`p-3 sm:p-4 cursor-pointer hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 group bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 ${
                      feed.isLiveStream ? 'border-red-500/40 bg-gradient-to-br from-red-500/5 to-orange-500/5' : ''
                    }`}
                          onClick={() => {
                            setSelectedCamera(feed);
                            setCameraModalOpen(true);
                          }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                          <Video className={`h-4 w-4 ${feed.isLiveStream ? 'text-red-500' : 'text-purple-500'} group-hover:animate-bounce`} />
                          {feed.name}
                          {feed.isLiveStream && (
                            <Badge variant="default" className="text-xs bg-red-500 text-white animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full animate-ping mr-1"></div>
                              LIVE
                            </Badge>
                          )}
                        </h4>
                        <Badge variant="default" className="flex items-center gap-1 text-xs bg-green-500 text-white">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)} animate-ping`}></div>
                          {feed.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            Zone:
                          </span>
                          <span className="font-medium">{feed.zone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            Type:
                          </span>
                          <span className="font-medium capitalize">{feed.type}</span>
                          </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Tv className="h-3 w-3" />
                            Resolution:
                          </span>
                          <span className="font-medium">{feed.resolution}</span>
                          </div>
                        {feed.isLiveStream && (
                        <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <Wifi className="h-3 w-3 text-red-500" />
                              Stream:
                            </span>
                            <span className="font-medium text-red-500">Live IP Camera</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Crowd Count:
                          </span>
                          <span className="font-medium">{feed.crowdCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last Update:
                          </span>
                          <span className="font-medium">{feed.lastUpdate}</span>
                        </div>
                
                      </div>
                    </Card>
                  ))}
                    </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {/* Alerts */}
            <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                      <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Active Alerts
                      </span>
                </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Current warnings and critical notifications with automated response
                </CardDescription>
                  </div>
                  
                  {/* Audio Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-red-500" />
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="marathi">Marathi</SelectItem>
                          <SelectItem value="gujarati">Gujarati</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Volume2Icon className="h-4 w-4 text-red-500" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-16 accent-red-500"
                      />
                    </div>
                    
                    {isAudioPlaying ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopAlertAudio}
                        className="bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                      >
                        <VolumeX className="h-4 w-4 mr-1" />
                        Stop Audio
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alerts.length > 0 && playAlertAudio(alerts[0])}
                        className="bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                      >
                        <Megaphone className="h-4 w-4 mr-1" />
                        Test Audio
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {/* User Email Management Section */}
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-t border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      Alert Recipients: {userEmails.length} verified users
                    </span>
                    {isLoadingEmails && (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchUserEmails}
                    disabled={isLoadingEmails}
                    className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Refresh Users
                  </Button>
                </div>
                {userEmails.length > 0 && (
                  <div className="mt-2 text-xs text-blue-500">
                    Alerts will be sent to all verified users in the database
                  </div>
                )}
              </div>
              
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.type === 'danger' ? 'destructive' : alert.type === 'warning' ? 'default' : 'default'} className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20">
                      <AlertTriangle className="h-4 w-4 animate-pulse" />
                      <AlertTitle className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {alert.zone}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-3 w-3" />
                        {alert.message}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Level: {alert.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {alert.emailSent ? 'Email Sent' : 'Email Pending'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Megaphone className="h-3 w-3" />
                            {alert.audioPlaying ? 'Audio Playing' : 'Audio Ready'}
                          </span>
                        </div>
                        
                        {/* Alert Actions */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendAlertToAllUsers(alert)}
                            disabled={alert.emailSent}
                            className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            {alert.emailSent ? 'Email Sent' : 'Send to All Users'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAlertAudio(alert)}
                            disabled={alert.audioPlaying}
                            className="text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                          >
                            <Megaphone className="h-3 w-3 mr-1" />
                            {alert.audioPlaying ? 'Playing...' : 'Play Audio'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlertForMap(alert);
                              setShowCustomMap(true);
                            }}
                            className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            View on Map
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => clearAlert(alert.id)}
                            className="text-xs bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear Alert
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                

                 
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Camera Modal */}
      <Dialog open={cameraModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[90vw] sm:max-w-3xl w-full mx-2 sm:mx-auto bg-gradient-to-br from-gray-900 to-black border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base text-white">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {selectedCamera?.name} - {selectedCamera?.zone}
              </span>
                </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-300">
              Live feed from {selectedCamera?.type} camera
                </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-black rounded-lg h-64 sm:h-72 md:h-80 flex items-center justify-center relative border border-purple-500/30">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-lg">Loading Video...</p>
              </div>
            </div>
              )}
              
              {videoError ? (
              <div className="text-white text-center">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500 animate-pulse" />
                  <p className="text-lg text-red-500">Video Error</p>
                  <p className="text-sm text-gray-400 mt-2">{videoError}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 text-white border-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      setVideoError(null);
                      setIsVideoLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
              </div>
              ) : selectedCamera?.isLiveStream ? (
                // Live Webcam Stream with Person Counting
                <div className="w-full h-full flex flex-col">
                  {/* Live Stream Header */}
                  <div className="bg-red-500/20 border-b border-red-500/40 p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-red-400 font-semibold text-sm">LIVE STREAM</span>
              </div>
                    <p className="text-white text-xs">{selectedCamera.zone} - IP Camera - Method: {streamMethod.toUpperCase()}</p>
            </div>
                  
                  {/* Embedded Live Stream */}
                  <div className="flex-1 flex items-center justify-center bg-black relative">
                    {isVideoLoading && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading Stream...</p>
                        <p className="text-gray-400 text-sm mt-2">Trying {streamMethod} method</p>
                      </div>
                    )}
                    
                    {videoError ? (
                      <div className="text-white text-center">
                        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500 animate-pulse" />
                        <p className="text-lg text-red-500">Stream Error</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-md">{videoError}</p>
                        <div className="flex gap-2 mt-4 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => tryStreamMethod(selectedCamera, 'mjpeg')}
                            className="text-white border-white hover:bg-white hover:text-black"
                          >
                            Try MJPEG
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => tryStreamMethod(selectedCamera, 'video')}
                            className="text-white border-white hover:bg-white hover:text-black"
                          >
                            Try Video
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => tryStreamMethod(selectedCamera, 'image')}
                            className="text-white border-white hover:bg-white hover:text-black"
                          >
                            Try Images
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        {/* Video Element for MJPEG/Video streams */}
                        {(streamMethod === 'mjpeg' || streamMethod === 'video') && (
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover rounded-lg"
                            autoPlay
                            muted
                            playsInline
                            onLoadStart={() => setIsVideoLoading(true)}
                            onLoadedData={() => {
                              setIsVideoLoading(false);
                              setVideoError(null);
                            }}
                            onError={(e) => {
                              console.error('Video error:', e);
                              setIsVideoLoading(false);
                              setVideoError('Video stream failed. Please check IP Webcam connection.');
                            }}
                          />
                        )}
                        
                        {/* Image Element for image refresh method */}
                        {streamMethod === 'image' && (
                          <img
                            ref={imgRef}
                            className="w-full h-full object-cover rounded-lg"
                            alt="Live Stream"
                            onLoad={() => {
                              setIsVideoLoading(false);
                              setVideoError(null);
                            }}
                            onError={() => {
                              setVideoError('Image stream failed. Please check IP Webcam connection.');
                            }}
                          />
                        )}
                        
                        {/* Live Indicator Overlay */}
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          LIVE - {streamMethod.toUpperCase()}
                        </div>
                        
                        {/* Stream Info Overlay */}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {selectedCamera.baseUrl} - {streamMethod}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Stream Controls */}
                  <div className="bg-red-500/10 border-t border-red-500/40 p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => tryStreamMethod(selectedCamera, 'mjpeg')}
                        className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20"
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        MJPEG Stream
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => tryStreamMethod(selectedCamera, 'video')}
                        className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Video Stream
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => tryStreamMethod(selectedCamera, 'image')}
                        className="text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Image Refresh
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.load();
                            setIsVideoLoading(true);
                          }
                        }}
                        className="text-xs bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reconnect
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startPersonCounting()}
                        disabled={isCountingActive}
                        className="text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        {isCountingActive ? 'Counting...' : 'Start AI Counter'}
                      </Button>
                      
                      {isCountingActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => stopPersonCounting()}
                          className="text-xs bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Stop Counter
                        </Button>
                      )}
                      
                    </div>
                  </div>
                </div>
              ) : (
                // Regular Video File
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                  autoPlay
                  muted
                  loop
                  onLoadStart={() => setIsVideoLoading(true)}
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                >
                  <source src={selectedCamera?.videoFile} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Video Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePlayPause}
                disabled={!!videoError}
                className="text-xs sm:text-sm px-2 sm:px-3 bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all duration-300 hover:scale-105"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Play/Pause
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestart}
                disabled={!!videoError}
                className="text-xs sm:text-sm px-2 sm:px-3 bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Restart
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFullscreen}
                disabled={!!videoError}
                className="text-xs sm:text-sm px-2 sm:px-3 bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 transition-all duration-300 hover:scale-105"
              >
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Fullscreen
              </Button>
              <div className="flex items-center gap-1 sm:gap-2">
                <Volume1 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-300" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0"
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 accent-purple-500"
                  disabled={!!videoError}
                />
            </div>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Map Modal for Alert Location */}
      <Dialog open={showCustomMap} onOpenChange={setShowCustomMap}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl w-full mx-2 sm:mx-auto bg-gradient-to-br from-gray-900 to-black border-green-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base text-white">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 animate-pulse" />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Alert Location: {selectedAlertForMap?.zone}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-300">
              View alert location on campus map with safe routes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            {selectedAlertForMap && (
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-red-500">{selectedAlertForMap.zone}</h3>
                  <Badge variant="destructive" className="ml-auto">
                    {selectedAlertForMap.level}
                  </Badge>
                </div>
                <p className="text-gray-300 mb-2">{selectedAlertForMap.message}</p>
                <div className="text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedAlertForMap.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Custom Map Component */}
            <div className="w-full h-[500px] sm:h-[600px] rounded-lg border-2 border-green-500/30 shadow-lg">
              <CrowdHeatmap 
                highlightAlertLocation={selectedAlertForMap?.coordinates}
                alertZone={selectedAlertForMap?.zone}
              />
            </div>
            
            {/* Map Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomMap(false)}
                className="text-xs sm:text-sm bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Close Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}