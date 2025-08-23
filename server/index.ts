import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { sendAlertEmail, testEmailService, verifyEmailConfig } from './emailService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Email endpoints
  app.post('/api/send-alert-email', async (req, res) => {
    try {
      const { alert, recipientEmails } = req.body;
      
      if (!alert || !recipientEmails || !Array.isArray(recipientEmails)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid request data. Alert and recipientEmails array required.' 
        });
      }

      const result = await sendAlertEmail(alert, recipientEmails);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Alert email sent successfully',
          messageId: result.messageId 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Error sending alert email:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  app.post('/api/test-email', async (req, res) => {
    try {
      const result = await testEmailService();
      res.json(result);
    } catch (error) {
      console.error('Error testing email service:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  app.get('/api/email-config', (req, res) => {
    try {
      const config = verifyEmailConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting email config:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'CrowdShield Email Service'
    });
  });

  return app;
}
