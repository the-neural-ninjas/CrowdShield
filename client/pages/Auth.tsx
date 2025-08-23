import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Brain,
  Users,
  MapPin,
  Camera,
  AlertTriangle,
  IdCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  token_type?: string;
  requires_otp?: boolean;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  employeeId: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [signupData, setSignupData] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: ""
  });
  const [signinData, setSigninData] = useState({
    email: "",
    password: ""
  });
  const [otpData, setOtpData] = useState({
    email: "",
    otp: ""
  });

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending signup request to:", "http://localhost:8000/api/signup");
      console.log("Signup data:", {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        employeeId: signupData.employeeId
      });

      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          employeeId: signupData.employeeId
        }),
      });

      console.log("Response status:", response.status);
      const data: AuthResponse = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        setSuccess(data.message);
        // Always show OTP form after successful signup
        setOtpData({ ...otpData, email: signupData.email });
        setShowOTP(true);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please check if the backend server is running on http://localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending signin request to:", "http://localhost:8000/api/signin");
      console.log("Signin data:", signinData);

      const response = await fetch("http://localhost:8000/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signinData),
      });

      console.log("Signin response status:", response.status);
      const data: AuthResponse = await response.json();
      console.log("Signin response data:", data);

      if (response.ok && data.success) {
        if (data.requires_otp) {
          setSuccess(data.message);
          // Always show OTP form when required
          setOtpData({ ...otpData, email: signinData.email });
          setShowOTP(true);
        } else if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Signin failed");
      }
    } catch (err) {
      console.error("Signin error:", err);
      setError("Network error. Please check if the backend server is running on http://localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        navigate("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: otpData.email }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (form: string, field: string, value: string) => {
    if (form === "signup") {
      setSignupData({ ...signupData, [field]: value });
    } else if (form === "signin") {
      setSigninData({ ...signinData, [field]: value });
    } else if (form === "otp") {
      setOtpData({ ...otpData, [field]: value });
    }
  };

  const resetForms = () => {
    setSignupData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      employeeId: ""
    });
    setSigninData({
      email: "",
      password: ""
    });
    setOtpData({
      email: "",
      otp: ""
    });
    setError("");
    setSuccess("");
    setShowOTP(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Shield className="h-12 w-12 text-yellow-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              CrowdShield
            </h1>
          </div>
          <p className="text-blue-200 text-sm">
            AI-Powered Crowd Management System
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {showOTP ? "Verify Your Email" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-blue-200">
              {showOTP 
                ? "Enter the verification code sent to your email"
                : "Sign in to access your dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {!showOTP ? (
              <>
                {/* Auth Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => {
                  setActiveTab(value);
                  resetForms();
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white/20">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white/20">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4 mt-6">
                    <form onSubmit={handleSignin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-white">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signinData.email}
                            onChange={(e) => handleInputChange("signin", "email", e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-white">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signinData.password}
                            onChange={(e) => handleInputChange("signin", "password", e.target.value)}
                            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="mr-2 h-4 w-4" />
                        )}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={signupData.name}
                            onChange={(e) => handleInputChange("signup", "name", e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-employee-id" className="text-white">Employee ID</Label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-employee-id"
                            type="text"
                            placeholder="Enter your employee ID"
                            value={signupData.employeeId}
                            onChange={(e) => handleInputChange("signup", "employeeId", e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-white">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signupData.email}
                            onChange={(e) => handleInputChange("signup", "email", e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-white">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={signupData.password}
                            onChange={(e) => handleInputChange("signup", "password", e.target.value)}
                            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password" className="text-white">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signupData.confirmPassword}
                            onChange={(e) => handleInputChange("signup", "confirmPassword", e.target.value)}
                            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              /* OTP Verification Form */
              <form onSubmit={handleOTPVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-code" className="text-white">Verification Code</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpData.otp}
                      onChange={(e) => handleInputChange("otp", "otp", e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => {
                      setShowOTP(false);
                      resetForms();
                    }}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Verify
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-blue-200 hover:text-white"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Didn't receive code? Resend
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 