import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CrowdHeatmap from "@/components/CrowdHeatmap";
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
  X
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCamera, setSelectedCamera] = useState<typeof activeFeeds[0] | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      zone: "Gate 3 Entry",
      message: "Crowd density at 89% - Approaching safety threshold",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: "Medium"
    },
    {
      id: 2,
      type: "danger",
      zone: "Main Pavilion",
      message: "Critical congestion detected - Immediate action required",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: "High"
    }
  ]);

  const zoneData = [
    { name: "Zone 1", capacity: 10000, current: 9240, status: "critical" },
    { name: "Zone 2", capacity: 5000, current: 4450, status: "warning" },
    { name: "Zone 3", capacity: 3000, current: 1850, status: "normal" },
    { name: "Zone 4", capacity: 4000, current: 2100, status: "normal" },
    { name: "Zone 5", capacity: 8000, current: 6200, status: "warning" },
  ];

  const activeFeeds = [
    {
      id: 1,
      name: "Zone 1",
      zone: "O Building",
      status: "active",
      type: "cctv",
      resolution: "4K Ultra HD",
      lastUpdate: "2 seconds ago",
      crowdCount: 9240
    },
    {
      id: 2,
      name: "Zone 2",
      zone: "Olive",
      status: "active",
      type: "cctv",
      resolution: "1080p HD",
      lastUpdate: "1 second ago",
      crowdCount: 4450
    },
    {
      id: 3,
      name: "Zone 3",
      zone: "O'S Link",
      status: "active",
      type: "cctv",
      resolution: "4K Ultra HD",
      lastUpdate: "3 seconds ago",
      crowdCount: 1850
    },
    {
      id: 4,
      name: "Zone 4",
      zone: "S Building Amphithreatre",
      status: "Active",
      type: "cctv",
      resolution: "720p HD",
      lastUpdate: "5 minutes ago",
      crowdCount: 0
    },
  ];

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

  const openCameraFeed = (feed: typeof activeFeeds[0]) => {
    if (feed.status === 'active') {
      setSelectedCamera(feed);
      setCameraModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CrowdShield</span>
            <Badge variant="secondary" className="ml-2">Sandip University Nashik</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
              <div className="text-lg font-mono">{formatTime(currentTime)}</div>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {zoneData.reduce((sum, zone) => sum + zone.capacity, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Maximum venue capacity</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Crowd</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {zoneData.reduce((sum, zone) => sum + zone.current, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Real-time occupancy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((zoneData.reduce((sum, zone) => sum + zone.current, 0) / zoneData.reduce((sum, zone) => sum + zone.capacity, 0)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall venue usage</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">Current warnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="cameras">Camera Feeds</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zoneData.map((zone) => (
                    <Card key={zone.name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{zone.name}</h4>
                        <Badge 
                          variant={zone.status === 'critical' ? 'destructive' : zone.status === 'warning' ? 'secondary' : 'default'}
                        >
                          {zone.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Capacity:</span>
                          <span className="font-medium">{zone.capacity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current:</span>
                          <span className="font-medium">{zone.current.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Utilization:</span>
                            <span className="font-medium">{Math.round((zone.current / zone.capacity) * 100)}%</span>
                          </div>
                          <Progress value={(zone.current / zone.capacity) * 100} className="h-2" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Camera Feeds
                </CardTitle>
                <CardDescription>
                  Real-time monitoring from CCTV and drone cameras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeFeeds.map((feed) => (
                    <Card key={feed.id} className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => {
                            setSelectedCamera(feed);
                            setCameraModalOpen(true);
                          }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{feed.name}</h4>
                        <Badge variant="default" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)}`}></div>
                          {feed.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Zone:</span>
                          <span className="font-medium">{feed.zone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium capitalize">{feed.type}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>Resolution:</span>
                          <span className="font-medium">{feed.resolution}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>Crowd Count:</span>
                          <span className="font-medium">{feed.crowdCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Update:</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Current warnings and critical notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.type === 'danger' ? 'destructive' : alert.type === 'warning' ? 'default' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alert.zone}</AlertTitle>
                      <AlertDescription>
                        {alert.message}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Level: {alert.level} • {alert.timestamp.toLocaleTimeString()}
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
      <Dialog open={cameraModalOpen} onOpenChange={setCameraModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
                  {selectedCamera?.name} - {selectedCamera?.zone}
                </DialogTitle>
            <DialogDescription>
              Live feed from {selectedCamera?.type} camera
                </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-black rounded-lg h-96 flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Live Camera Feed</p>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedCamera?.resolution} • Last Update: {selectedCamera?.lastUpdate}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Crowd Count</p>
                <p className="text-2xl font-bold">{selectedCamera?.crowdCount.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="default" className="mt-2">{selectedCamera?.status}</Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
