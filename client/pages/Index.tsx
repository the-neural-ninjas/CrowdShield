import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Map, AlertTriangle, Users, Zap, Camera, Brain, Navigation, Phone, Github, Instagram, Linkedin, Copyright, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      icon: Eye,
      title: "Live AI Detection",
      description: "Real-time people counting and tracking using YOLOv8 and OpenCV on CCTV/drone feeds",
      color: "text-primary"
    },
    {
      icon: Map,
      title: "Heatmap Dashboard",
      description: "Interactive heatmaps showing crowd density, congestion levels, and high-risk zones",
      color: "text-success"
    },
    {
      icon: AlertTriangle,
      title: "Predictive Alerts",
      description: "AI-powered early warning system for areas likely to cross safety thresholds",
      color: "text-warning"
    },
    {
      icon: Navigation,
      title: "Route Optimization",
      description: "Smart route recommendations to redirect crowds through safer alternate paths",
      color: "text-primary"
    },
    {
      icon: Phone,
      title: "Emergency Protocols",
      description: "Integrated emergency response with fire, medical, and stampede prevention alerts",
      color: "text-danger"
    },
    {
      icon: Users,
      title: "Voice Assistant",
      description: "Multilingual TTS safety announcements and crowd guidance system",
      color: "text-accent"
    }
  ];

  return (
    <div
      className="min-h-screen relative bg-gradient-to-br from-primary/5 via-background to-accent/5"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://cdn.builder.io/api/v1/image/assets%2F186b930a2e8840a889277bce7be5a4cf%2Fbbdd6c72750a41c38abd77ed1fe65ea8?format=webp&width=800')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="border-b bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F186b930a2e8840a889277bce7be5a4cf%2Fdc6640201f5d4a0f8d15d877bc8736e1?format=webp&width=800"
                alt="Neural Ninjas"
                className="h-10 w-10 object-contain animate-pulse"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent animate-pulse">
              CrowdShield
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium hover:scale-105 transform duration-300">Features</a>
            <a href="#demo" className="text-muted-foreground hover:text-primary transition-colors font-medium hover:scale-105 transform duration-300">Working</a>
            <a href="#footer" className="text-muted-foreground hover:text-primary transition-colors font-medium hover:scale-105 transform duration-300">Contact us</a>
          </nav>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-700 shadow-lg hover:shadow-xl">
              <Zap className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/40"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border-primary/30 hover:scale-105 transition-transform animate-bounce">
            <Shield className="mr-2 h-4 w-4 animate-pulse" />
            AI for Crowd & Disaster Management
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-600 to-accent bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
            CrowdShield
          </h1>
          <div className="backdrop-blur-sm bg-card/30 rounded-2xl p-8 border border-white/20 shadow-2xl mb-10 hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-medium">
              AI-driven system to manage mega-gatherings like <span className="text-primary font-bold animate-pulse">Nashik Kumbh Mela 2027</span>.
              Monitor population density in real-time, predict congestion, and assist
              authorities in evacuation and safety management.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl animate-pulse"
              >
                <Zap className="mr-2 h-6 w-6 animate-bounce" />
                Access Panel
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-accent/10 to-orange-100/50 border-accent/50 hover:bg-gradient-to-r hover:from-accent/20 hover:to-orange-200/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl backdrop-blur-sm"
            >
              <Camera className="mr-2 h-6 w-6 animate-pulse" />
              View Demo Flow
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-card/60 backdrop-blur-sm"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Key Features
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered crowd management system with real-time monitoring and predictive analytics
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-card/70 backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-card/80 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-muted to-muted/50 ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-md animate-pulse`}>
                      <feature.icon className="h-7 w-7 animate-bounce" />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-foreground/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Flow Section */}
      <section id="demo" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-card/60 backdrop-blur-sm"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Demo Flow
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              See how CrowdShield works in real-world scenarios
            </p>
          </div>
          <Card className="max-w-5xl mx-auto bg-card/80 backdrop-blur-md shadow-2xl border-0 hover:shadow-3xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Brain className="h-8 w-8 text-primary" />
                Example: Nashik Kumbh Mela 2027
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="font-bold mb-3 text-lg text-primary">Drone Camera Feed</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Live video feed from surveillance drones monitoring Gate 3 area
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 text-warning-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="font-bold mb-3 text-lg text-warning">AI Detection</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    System shows area near Gate 3 is over 90% capacity
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-danger to-red-600 text-danger-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-bold mb-3 text-lg text-danger">Auto Response</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Dashboard glows red, authorities get auto-alert with suggested alternate routes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Footer */}
      <footer id="footer" className="border-t bg-gradient-to-r from-card/80 to-muted/60 backdrop-blur-md py-12 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/the-neural-ninjas"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Github className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </a>

              <a
                href="https://www.instagram.com/_yash_tripathi_21__?igsh=MWE1czZlaG8wc3phZQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Instagram className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </a>

              <a
                href="https://www.linkedin.com/in/yashovardhan-tripathi-05220225a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Linkedin className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </a>
            </div>

            {/* Disclaimer */}
            <div className="flex-1 max-w-2xl">
              <p className="text-xs text-foreground/60 text-center italic">
                "CrowdShield is a prototype designed to assist and inspire. Built to learn, improve, and deliver valuable insights."
              </p>
            </div>

            {/* Copyright and Contact */}
            <div className="flex flex-col items-center gap-1 text-xs">
              <div className="flex items-center gap-2 text-foreground/70">
                <Copyright className="h-3 w-3" />
                <span className="font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Neural Ninja's
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground/60">
                <Mail className="h-3 w-3" />
                <a
                  href="mailto:theneuralninjas@gmail.com"
                  className="hover:text-primary transition-colors duration-300"
                >
                  theneuralninjas@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
