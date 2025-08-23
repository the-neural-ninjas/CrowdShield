from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
import os
from typing import Optional
import httpx
from authlib.integrations.starlette_client import OAuth
import boto3
from dotenv import load_dotenv
import certifi
import logging
import re
import motor.motor_asyncio
from bson import ObjectId

# Import person counting service
from person_counter_service import person_counter_service

load_dotenv()

app = FastAPI(title="CrowdShield Authentication API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "junglicheats9631@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "onou aiqh weca xfkf")

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "crowdshield_db")

# Initialize MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]
users_collection = database.get_collection("users")
otp_collection = database.get_collection("otps")

# Create indexes for data integrity
async def create_indexes():
    try:
        # Unique index on email to prevent duplicates
        await users_collection.create_index("email", unique=True)
        # Index on employeeId to prevent duplicates
        await users_collection.create_index("employeeId", unique=True)
        # TTL index on OTP expiration
        await otp_collection.create_index("expires_at", expireAfterSeconds=0)
        # Index on OTP email for faster lookups
        await otp_collection.create_index("email")
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️ Index creation warning: {e}")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handling
security = HTTPBearer()

# Pydantic models
class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    password: str
    employeeId: str

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class OTPVerification(BaseModel):
    email: EmailStr
    otp: str

class ResendOTP(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    employeeId: str
    is_verified: bool

# Utility Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

async def send_otp_email(email: str, otp: str) -> bool:
    try:
        subject = "Your CrowdShield Verification Code"
        body = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">CrowdShield</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Email Verification</p>
                </div>
                
                <div style="padding: 25px;">
                    <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px;">{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; font-size: 13px; color: #666; text-align: center;">
                    <p>© 2025 CrowdShield. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email.lower()})
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.post("/api/signup")
async def signup(user_data: UserSignUp):
    try:
        normalized_email = user_data.email.lower()
        
        existing_user = await users_collection.find_one({"email": normalized_email})
        if existing_user:
            if existing_user.get("is_verified"):
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email already exists. Please sign in instead."
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email already exists but is not verified. Please check your email for verification code or use the resend option."
                )

        # Create new user
        user_doc = {
            "name": user_data.name,
            "email": normalized_email,
            "employeeId": user_data.employeeId,
            "password_hash": hash_password(user_data.password),
            "is_verified": False,
            "created_at": datetime.utcnow()
        }

        await users_collection.insert_one(user_doc)
        
        # Generate and send OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        otp_doc = {
            "email": normalized_email,
            "code": otp_code,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_used": False
        }

        await otp_collection.delete_one({"email": normalized_email}) # Delete any existing OTP for this email
        await otp_collection.insert_one(otp_doc)

        # Send OTP email
        email_sent = await send_otp_email(normalized_email, otp_code)
        
        return {
            "success": True,
            "message": "Account created successfully. Check your email for verification code."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/signin")
async def signin(user_data: UserSignIn):
    try:
        normalized_email = user_data.email.lower()
        
        # Check if user exists first
        user = await users_collection.find_one({"email": normalized_email})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not registered. Please sign up first."
            )

        # Check password
        if not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Check if user is verified
        if not user.get("is_verified"):
            # Generate and send OTP only for unverified users with correct credentials
            otp_code = generate_otp()
            expires_at = datetime.utcnow() + timedelta(minutes=10)
            
            otp_doc = {
                "email": normalized_email,
                "code": otp_code,
                "created_at": datetime.utcnow(),
                "expires_at": expires_at,
                "is_used": False
            }

            await otp_collection.delete_one({"email": normalized_email}) # Delete any existing OTP for this email
            await otp_collection.insert_one(otp_doc)

            email_sent = await send_otp_email(normalized_email, otp_code)
            
            return {
                "success": True,
                "requires_otp": True,
                "message": "Please verify your email to continue."
            }

        # Create access token for verified users
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )

        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Signed in successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Signin error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/verify-otp")
async def verify_otp(otp_data: OTPVerification):
    try:
        normalized_email = otp_data.email.lower()
        
        otp_record = await otp_collection.find_one({"email": normalized_email})
        if not otp_record or otp_record["code"] != otp_data.otp or otp_record["is_used"] or otp_record["expires_at"] < datetime.utcnow():
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired verification code"
            )

        # Mark OTP as used
        otp_record["is_used"] = True
        await otp_collection.replace_one({"_id": otp_record["_id"]}, otp_record)

        # Mark user as verified
        user = await users_collection.find_one({"email": normalized_email})
        if user:
            user["is_verified"] = True
            await users_collection.replace_one({"_id": user["_id"]}, user)

        # Get user and create token
        user = await users_collection.find_one({"email": normalized_email})
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )

        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Email verified successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/resend-otp")
async def resend_otp(resend_data: ResendOTP):
    try:
        normalized_email = resend_data.email.lower()
        
        user = await users_collection.find_one({"email": normalized_email})
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if user.get("is_verified"):
            raise HTTPException(
                status_code=400,
                detail="User is already verified"
            )

        # Generate new OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        otp_doc = {
            "email": normalized_email,
            "code": otp_code,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_used": False
        }

        await otp_collection.delete_one({"email": normalized_email}) # Delete existing OTPs and create new one
        await otp_collection.insert_one(otp_doc)

        # Send OTP email
        email_sent = await send_otp_email(normalized_email, otp_code)

        return {
            "success": True,
            "message": "Verification code sent successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["email"],
        name=current_user["name"],
        email=current_user["email"],
        employeeId=current_user["employeeId"],
        is_verified=current_user["is_verified"]
    )

@app.get("/api/users/emails")
async def get_all_user_emails():
    """Get all verified user emails for alert notifications"""
    try:
        # Get all verified users' emails
        users = await users_collection.find(
            {"is_verified": True}, 
            {"email": 1, "name": 1, "employeeId": 1}
        ).to_list(length=None)
        
        emails = [
            {
                "email": user["email"],
                "name": user["name"],
                "employeeId": user["employeeId"]
            }
            for user in users
        ]
        
        return {
            "success": True,
            "count": len(emails),
            "users": emails
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user emails: {str(e)}")

@app.post("/api/send-alert-to-all-users")
async def send_alert_to_all_users(alert_data: dict):
    """Send alert email to all verified users in the database"""
    try:
        # Get all verified user emails
        users = await users_collection.find(
            {"is_verified": True}, 
            {"email": 1, "name": 1, "employeeId": 1}
        ).to_list(length=None)
        
        if not users:
            return {
                "success": False,
                "message": "No verified users found in database"
            }
        
        # Prepare alert email content
        subject = f"CrowdShield Alert: {alert_data.get('type', 'General Alert')}"
        
        # Create detailed email body
        body = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🚨 CrowdShield Alert</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Emergency Notification</p>
                </div>
                
                <div style="padding: 25px;">
                    <h2 style="color: #333; margin-top: 0;">Alert Details</h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <h3 style="color: #dc3545; margin-top: 0;">{alert_data.get('zone', 'Unknown Zone')}</h3>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                            {alert_data.get('message', 'Alert message not provided')}
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                            <div>
                                <strong>Alert Level:</strong> {alert_data.get('level', 'Unknown')}
                            </div>
                            <div>
                                <strong>Timestamp:</strong> {alert_data.get('timestamp', 'Unknown')}
                            </div>
                        </div>
                    </div>
                    
                    {f'''
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">📍 Location Information</h3>
                        <p style="color: #856404; margin: 0;">
                            <strong>Coordinates:</strong> {alert_data.get('coordinates', 'Unknown')}<br>
                            <a href="https://www.google.com/maps?q={alert_data.get('coordinates', '')}" target="_blank" style="color: #856404;">
                                🗺️ View on Google Maps
                            </a>
                        </p>
                    </div>
                    ''' if alert_data.get('coordinates') else ''}
                    
                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #0c5460; margin-top: 0;">🚨 Immediate Actions Required</h3>
                        <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
                            <li>Follow designated safe routes</li>
                            <li>Maintain social distance</li>
                            <li>Listen to authority instructions</li>
                            <li>Evacuate if directed</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; font-size: 13px; color: #666; text-align: center;">
                    <p>© 2025 CrowdShield. This is an automated emergency alert.</p>
                    <p>If you have questions, contact your system administrator.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email to all users
        sent_count = 0
        failed_emails = []
        
        for user in users:
            try:
                msg = MIMEMultipart()
                msg['From'] = EMAIL_ADDRESS
                msg['To'] = user["email"]
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'html'))
                
                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                text = msg.as_string()
                server.sendmail(EMAIL_ADDRESS, user["email"], text)
                server.quit()
                
                sent_count += 1
                print(f"✅ Alert sent to {user['email']} ({user['name']})")
                
            except Exception as e:
                failed_emails.append({
                    "email": user["email"],
                    "name": user["name"],
                    "error": str(e)
                })
                print(f"❌ Failed to send alert to {user['email']}: {e}")
        
        return {
            "success": True,
            "message": f"Alert sent to {sent_count} users",
            "total_users": len(users),
            "sent_count": sent_count,
            "failed_count": len(failed_emails),
            "failed_emails": failed_emails
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send alert emails: {str(e)}")

@app.post("/api/logout")
async def logout():
    # In a production app, you might want to blacklist the token
    return {"success": True, "message": "Logged out successfully"}

# Person Counting API Endpoints
@app.post("/api/start-person-counting")
async def start_person_counting(request: Request):
    """Start AI person counting on live stream"""
    try:
        data = await request.json()
        stream_url = data.get("streamUrl")
        zone = data.get("zone")
        
        if not stream_url or not zone:
            raise HTTPException(
                status_code=400,
                detail="Stream URL and zone are required"
            )
        
        result = person_counter_service.start_counting(stream_url, zone)
        return result
        
    except Exception as e:
        logging.error(f"Failed to start person counting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/stop-person-counting")
async def stop_person_counting():
    """Stop AI person counting"""
    try:
        result = person_counter_service.stop_counting()
        return result
        
    except Exception as e:
        logging.error(f"Failed to stop person counting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/person-counting-status")
async def get_person_counting_status():
    """Get current person counting status and counts"""
    try:
        result = person_counter_service.get_status()
        return result
        
    except Exception as e:
        logging.error(f"Failed to get person counting status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Startup event to create indexes
@app.on_event("startup")
async def startup_event():
    await create_indexes()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 