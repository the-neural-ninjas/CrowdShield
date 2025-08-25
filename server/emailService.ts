import * as nodemailer from 'nodemailer';

// Email configuration

const EMAIL_CONFIG = {
  EMAIL_ADDRESS: process.env.EMAIL_ADDRESS || 'junglicheats9631@gmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'onou aiqh weca xfkf',
  SMTP_SERVER: process.env.SMTP_SERVER || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587')
};

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: EMAIL_CONFIG.SMTP_SERVER,
  port: EMAIL_CONFIG.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_CONFIG.EMAIL_ADDRESS,
    pass: EMAIL_CONFIG.EMAIL_PASSWORD
  }
});

// Email template for alerts
const createAlertEmailTemplate = (alert: any) => {
  const mapLink = `https://www.google.com/maps?q=${alert.coordinates[1]},${alert.coordinates[0]}`;
  const dashboardLink = `${process.env.DASHBOARD_URL || 'http://localhost:3000'}/dashboard`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CrowdShield Alert</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin: 20px 0; }
        .btn { display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 5px; color: white; font-weight: bold; }
        .btn-map { background-color: #3b82f6; }
        .btn-dashboard { background-color: #10b981; }
        .info-box { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-warning { background-color: #fef3c7; color: #d97706; }
        .status-danger { background-color: #fef2f2; color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">🚨 CROWDSHIELD ALERT</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Emergency Notification System</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h2 style="color: #dc2626; margin-top: 0;">Alert Details</h2>
            <p><strong>Zone:</strong> ${alert.zone}</p>
            <p><strong>Level:</strong> <span class="status-badge status-${alert.type}">${alert.level}</span></p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
          </div>
          
          <div class="info-box">
            <h3 style="color: #0369a1; margin-top: 0;">Quick Actions</h3>
            <div class="action-buttons">
              <a href="${mapLink}" class="btn btn-map" target="_blank">📍 View on Map</a>
              <a href="${dashboardLink}" class="btn btn-dashboard" target="_blank">🖥️ Open Dashboard</a>
            </div>
          </div>
          
          <div class="info-box">
            <h3 style="color: #d97706; margin-top: 0;">Safe Routes Available</h3>
            <p>Use the dashboard to view recommended safe routes and real-time crowd density.</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Check heatmap for congestion levels</li>
              <li>Follow designated evacuation routes</li>
              <li>Monitor real-time camera feeds</li>
              <li>Coordinate with emergency response teams</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>This is an automated alert from CrowdShield AI System.</strong></p>
          <p>If you have any questions, please contact the system administrator.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send alert email
export const sendAlertEmail = async (alert: any, recipientEmails: string[]) => {
  try {
    const mailOptions = {
      from: `"CrowdShield Alert System" <${EMAIL_CONFIG.EMAIL_ADDRESS}>`,
      to: recipientEmails.join(', '),
      subject: `🚨 CROWDSHIELD ALERT: ${alert.zone} - ${alert.level} Priority`,
      html: createAlertEmailTemplate(alert),
      text: `
        CROWDSHIELD ALERT
        
        Zone: ${alert.zone}
        Level: ${alert.level}
        Message: ${alert.message}
        Time: ${alert.timestamp.toLocaleString()}
        
        View on Map: https://www.google.com/maps?q=${alert.coordinates[1]},${alert.coordinates[0]}
        Open Dashboard: ${process.env.DASHBOARD_URL || 'http://localhost:3000'}/dashboard
        
        This is an automated alert from CrowdShield AI System.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Alert email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return { success: false, error: error.message };
  }
};

// Test email functionality
export const testEmailService = async () => {
  try {
    const testAlert = {
      zone: "Test Zone",
      level: "Test",
      message: "This is a test alert to verify email functionality",
      timestamp: new Date(),
      coordinates: [73.67058268174448, 19.96653781496715]
    };

    const result = await sendAlertEmail(testAlert, [EMAIL_CONFIG.EMAIL_ADDRESS]);
    return result;
  } catch (error) {
    console.error('Email service test failed:', error);
    return { success: false, error: error.message };
  }
};

// Verify email configuration
export const verifyEmailConfig = () => {
  return {
    emailAddress: EMAIL_CONFIG.EMAIL_ADDRESS,
    smtpServer: EMAIL_CONFIG.SMTP_SERVER,
    smtpPort: EMAIL_CONFIG.SMTP_PORT,
    isConfigured: !!(EMAIL_CONFIG.EMAIL_ADDRESS && EMAIL_CONFIG.EMAIL_PASSWORD)
  };
}; 
