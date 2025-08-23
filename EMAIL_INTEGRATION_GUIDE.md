# Email Integration Guide - CrowdShield

## Overview
The CrowdShield application now includes a fully functional email notification system using Gmail SMTP. This system automatically sends professional HTML emails to coordinators when alerts are triggered.

## 📧 **Email Configuration**

### **Environment Variables**
The email service uses the following environment variables (stored in `.env` file):

```env
EMAIL_ADDRESS=junglicheats9631@gmail.com
EMAIL_PASSWORD=onou aiqh weca xfkf
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
DASHBOARD_URL=http://localhost:3000
```

### **Gmail App Password Setup**
The email password used is a Gmail App Password, not the regular account password. This provides secure access to Gmail's SMTP service.

## 🚀 **Email Service Features**

### **1. Professional HTML Email Templates**
- **Responsive Design**: Works on all email clients and devices
- **Branded Header**: CrowdShield branding with emergency styling
- **Alert Details**: Clear presentation of zone, level, message, and timestamp
- **Action Buttons**: Direct links to maps and dashboard
- **Safe Route Information**: Instructions for emergency response

### **2. Automated Email Sending**
- **Real-time Alerts**: Emails sent immediately when alerts are triggered
- **Multiple Recipients**: Sends to all registered coordinators simultaneously
- **Status Tracking**: Confirms email delivery and tracks message IDs
- **Error Handling**: Graceful failure handling with user feedback

### **3. Email Content Structure**
```html
<!-- Email Template Structure -->
1. Header: Emergency alert branding
2. Alert Details: Zone, level, message, timestamp
3. Quick Actions: Map and dashboard links
4. Safe Routes: Emergency response instructions
5. Footer: System information and disclaimers
```

## 🔧 **Technical Implementation**

### **Server-Side Email Service**
```typescript
// emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD
  }
});
```

### **API Endpoints**
```typescript
// Email endpoints in server/index.ts
POST /api/send-alert-email    // Send alert emails
POST /api/test-email          // Test email functionality
GET  /api/email-config        // Get email configuration status
GET  /api/health              // Health check endpoint
```

### **Client-Side Integration**
```typescript
// Dashboard.tsx
const sendAlertEmail = async (alert) => {
  const response = await fetch('/api/send-alert-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert, recipientEmails })
  });
  // Handle response...
};
```

## 📋 **Email Recipients**

### **Coordinator Email List**
```javascript
const coordinatorEmails = [
  "security@sandipuniversity.edu.in",
  "emergency@sandipuniversity.edu.in", 
  "coordinator@sandipuniversity.edu.in",
  "admin@sandipuniversity.edu.in"
];
```

### **Adding New Recipients**
To add new email recipients, update the `coordinatorEmails` array in `Dashboard.tsx`:

```javascript
const coordinatorEmails = [
  // ... existing emails
  "newcoordinator@sandipuniversity.edu.in"
];
```

## 🎨 **Email Template Features**

### **Visual Design**
- **Gradient Headers**: Red gradient for emergency branding
- **Color-coded Status**: Different colors for warning vs danger alerts
- **Professional Layout**: Clean, organized information presentation
- **Mobile Responsive**: Optimized for mobile email clients

### **Interactive Elements**
- **Map Links**: Direct Google Maps navigation to alert locations
- **Dashboard Links**: Quick access to real-time dashboard
- **Action Buttons**: Styled buttons for easy interaction

### **Content Sections**
1. **Alert Header**: Emergency branding and system identification
2. **Alert Details**: Comprehensive alert information
3. **Quick Actions**: Direct links to maps and dashboard
4. **Safe Routes**: Emergency response instructions
5. **System Footer**: Contact information and disclaimers

## 🔍 **Testing Email Functionality**

### **Test Email Button**
The dashboard includes a "Test Email Service" button that:
- Sends a test email to verify SMTP configuration
- Uses the configured email address as recipient
- Provides immediate feedback on success/failure
- Logs detailed error information for debugging

### **Manual Testing**
```javascript
// Test email function
const testEmailService = async () => {
  const response = await fetch('/api/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await response.json();
  // Handle result...
};
```

### **Email Configuration Verification**
```javascript
// Check email configuration
const verifyEmailConfig = () => {
  return {
    emailAddress: EMAIL_ADDRESS,
    smtpServer: SMTP_SERVER,
    smtpPort: SMTP_PORT,
    isConfigured: !!(EMAIL_ADDRESS && EMAIL_PASSWORD)
  };
};
```

## 🛡️ **Security & Privacy**

### **Gmail App Passwords**
- **Secure Access**: Uses Gmail App Passwords instead of account passwords
- **Limited Scope**: App passwords have restricted access
- **Revocable**: Can be revoked without affecting main account
- **No 2FA Issues**: Works with 2-factor authentication enabled

### **Environment Variables**
- **Secure Storage**: Credentials stored in `.env` file (not in code)
- **Git Ignored**: `.env` file excluded from version control
- **Local Only**: Environment variables loaded locally
- **Production Ready**: Can be configured for production deployment

### **Email Content**
- **No Sensitive Data**: Emails contain only alert information
- **Professional Content**: Appropriate for emergency notifications
- **Audit Trail**: Email delivery tracking and logging

## 📱 **Mobile & Email Client Compatibility**

### **Email Client Support**
- **Gmail**: Full support with responsive design
- **Outlook**: Compatible with HTML email templates
- **Apple Mail**: Optimized for iOS email client
- **Thunderbird**: Cross-platform email client support

### **Mobile Optimization**
- **Responsive Design**: Adapts to mobile screen sizes
- **Touch-Friendly**: Large buttons for mobile interaction
- **Fast Loading**: Optimized HTML for quick rendering
- **Cross-Platform**: Works on iOS and Android devices

## 🚀 **Production Deployment**

### **Environment Configuration**
For production deployment, update the `.env` file:

```env
EMAIL_ADDRESS=your-production-email@gmail.com
EMAIL_PASSWORD=your-production-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
DASHBOARD_URL=https://your-domain.com
```

### **Gmail App Password Setup**
1. Enable 2-Factor Authentication on Gmail account
2. Generate App Password for "Mail" application
3. Use App Password in EMAIL_PASSWORD environment variable
4. Test email functionality before deployment

### **Server Configuration**
- **HTTPS**: Use HTTPS for production dashboard URL
- **Domain**: Update DASHBOARD_URL to production domain
- **Monitoring**: Set up email delivery monitoring
- **Backup**: Configure backup email service if needed

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Authentication Failed**
```
Error: Invalid login
```
**Solution**: Verify Gmail App Password is correct and 2FA is enabled

#### **SMTP Connection Failed**
```
Error: Connection timeout
```
**Solution**: Check firewall settings and SMTP port configuration

#### **Email Not Delivered**
```
Error: Message rejected
```
**Solution**: Verify recipient email addresses and Gmail sending limits

### **Debugging Steps**
1. **Check Environment Variables**: Verify `.env` file configuration
2. **Test SMTP Connection**: Use test email button
3. **Check Gmail Settings**: Verify App Password and 2FA
4. **Monitor Logs**: Check server logs for detailed error messages
5. **Verify Recipients**: Test with valid email addresses

### **Gmail Sending Limits**
- **Daily Limit**: 500 emails per day for regular Gmail accounts
- **Rate Limiting**: 100 emails per hour
- **App Password**: Required for programmatic access
- **2FA Required**: Must be enabled for App Passwords

## 📊 **Monitoring & Analytics**

### **Email Delivery Tracking**
- **Message IDs**: Unique identifiers for each sent email
- **Success/Failure Logs**: Detailed logging of email operations
- **Delivery Status**: Confirmation of successful email delivery
- **Error Reporting**: Comprehensive error information

### **Performance Metrics**
- **Send Time**: Time taken to send each email
- **Success Rate**: Percentage of successfully delivered emails
- **Response Time**: API response times for email requests
- **Error Rates**: Frequency and types of email errors

## 🔄 **Future Enhancements**

### **Planned Features**
- **Email Templates**: Customizable email templates
- **Scheduling**: Delayed email sending options
- **Attachments**: Include maps or reports as attachments
- **Email Analytics**: Detailed email tracking and analytics
- **Multiple Providers**: Support for other email providers
- **Bulk Sending**: Optimized for large recipient lists

### **Advanced Features**
- **Email Preferences**: User-configurable email settings
- **Rich Media**: Enhanced email content with images and videos
- **Interactive Elements**: Embedded forms and surveys
- **Automated Responses**: Auto-reply and follow-up emails
- **Integration**: Connect with other notification systems

This email integration provides a robust, secure, and professional notification system that ensures all coordinators are immediately informed of any crowd management issues with detailed information and actionable links. 