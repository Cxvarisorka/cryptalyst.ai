const PriceAlert = require('../models/priceAlert.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const marketDataService = require('./marketData.service');
const nodemailer = require('nodemailer');
const { getCategoryTranslations } = require('../utils/emailTranslations');

class PriceAlertService {
  constructor() {
    this.checkInterval = null;
    this.isRunning = false;
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    // Configure email transporter (using Gmail as example)
    // You should add these to your .env file:
    // EMAIL_HOST=smtp.gmail.com
    // EMAIL_PORT=587
    // EMAIL_USER=your-email@gmail.com
    // EMAIL_PASS=your-app-password

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('Email transporter initialized');
    } else {
      console.warn('Email credentials not found. Email notifications will be disabled.');
    }
  }

  // Start the price checking service
  startPriceChecking(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('Price alert service is already running');
      return;
    }

    console.log(`Starting price alert service (checking every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Check immediately on start
    this.checkAllAlerts();

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkAllAlerts();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop the price checking service
  stopPriceChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isRunning = false;
      console.log('Price alert service stopped');
    }
  }

  // Check all active alerts
  async checkAllAlerts() {
    try {
      console.log('Checking price alerts...');

      // Find all active, non-triggered alerts
      const alerts = await PriceAlert.find({
        isActive: true,
        triggered: false
      });

      if (alerts.length === 0) {
        console.log('No active alerts to check');
        return;
      }

      console.log(`Checking ${alerts.length} active alerts`);

      // Group alerts by asset type and ID for efficient price fetching
      const alertsByAsset = {};
      alerts.forEach(alert => {
        const key = `${alert.assetType}:${alert.assetId}`;
        if (!alertsByAsset[key]) {
          alertsByAsset[key] = [];
        }
        alertsByAsset[key].push(alert);
      });

      // Check each group of alerts
      for (const [assetKey, assetAlerts] of Object.entries(alertsByAsset)) {
        const [assetType, assetId] = assetKey.split(':');
        await this.checkAlertsForAsset(assetType, assetId, assetAlerts);
      }

      console.log('Price alert check completed');
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  // Check alerts for a specific asset
  async checkAlertsForAsset(assetType, assetId, alerts) {
    try {
      // Get current price from market data service
      let currentPrice;

      if (assetType === 'crypto') {
        const crypto = await marketDataService.getCryptoById(assetId);
        currentPrice = crypto?.price;
      } else if (assetType === 'stock') {
        const stock = await marketDataService.getStockBySymbol(assetId);
        currentPrice = stock?.price;
      }

      if (!currentPrice) {
        console.warn(`Could not get current price for ${assetType} ${assetId}`);
        return;
      }

      // Check each alert
      for (const alert of alerts) {
        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

        if (shouldTrigger) {
          await this.triggerAlert(alert, currentPrice);
        } else {
          // Update last checked time and current price
          alert.lastChecked = new Date();
          alert.currentPrice = currentPrice;
          await alert.save();
        }
      }
    } catch (error) {
      console.error(`Error checking alerts for ${assetType} ${assetId}:`, error);
    }
  }

  // Determine if an alert should trigger
  shouldTriggerAlert(alert, currentPrice) {
    if (alert.alertType === 'above') {
      return currentPrice >= alert.targetPrice;
    } else if (alert.alertType === 'below') {
      return currentPrice <= alert.targetPrice;
    }
    return false;
  }

  // Trigger an alert
  async triggerAlert(alert, currentPrice) {
    try {
      console.log(`Triggering alert ${alert._id} for ${alert.assetSymbol}`);

      // Update alert status
      alert.triggered = true;
      alert.triggeredAt = new Date();
      alert.currentPrice = currentPrice;
      alert.lastChecked = new Date();
      await alert.save();

      // Get user details
      const user = await User.findById(alert.userId);
      if (!user) {
        console.error(`User not found for alert ${alert._id}`);
        return;
      }

      // Send in-app notification
      if (alert.notificationPreferences.inApp) {
        await this.sendInAppNotification(alert, user, currentPrice);
      }

      // Send email notification
      if (alert.notificationPreferences.email && this.emailTransporter) {
        await this.sendEmailNotification(alert, user, currentPrice);
      }

      console.log(`Alert ${alert._id} triggered successfully`);
    } catch (error) {
      console.error(`Error triggering alert ${alert._id}:`, error);
    }
  }

  // Send in-app notification
  async sendInAppNotification(alert, user, currentPrice) {
    try {
      const alertTypeText = alert.alertType === 'above' ? 'risen above' : 'fallen below';
      const message = `${alert.assetName} (${alert.assetSymbol}) has ${alertTypeText} $${alert.targetPrice.toFixed(2)}! Current price: $${currentPrice.toFixed(2)}`;

      await notificationService.createNotification({
        recipient: user._id,
        sender: null, // System notification, no sender
        type: 'price_alert',
        message,
        relatedEntity: {
          entityType: 'PriceAlert',
          entityId: alert._id
        }
      });

      console.log(`In-app notification sent for alert ${alert._id}`);
    } catch (error) {
      console.error(`Error sending in-app notification for alert ${alert._id}:`, error);
    }
  }

  // Send email notification
  async sendEmailNotification(alert, user, currentPrice) {
    try {
      if (!this.emailTransporter) {
        console.warn('Email transporter not configured, skipping email notification');
        return;
      }

      // Get user's language preference (default to English)
      const userLang = user.settings?.language || 'en';
      const t = getCategoryTranslations(userLang, 'priceAlert');

      // Format prices
      const formatPrice = (price) => {
        return price >= 1
          ? `$${price.toFixed(2)}`
          : `$${price.toFixed(6)}`;
      };

      const direction = alert.alertType === 'above' ? '↗' : '↘';
      const alertTypeText = alert.alertType === 'above' ? t.hasRisen : t.hasFallen;
      const assetTypeText = alert.assetType === 'crypto' ? t.cryptocurrency : t.stock;
      const alertTypeLabelText = alert.alertType === 'above' ? t.priceAbove : t.priceBelow;

      const mailOptions = {
        from: `"Cryptalyst" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `${direction} ${t.subject}: ${alert.assetSymbol}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f8faf9;
                  padding: 20px;
                  line-height: 1.6;
                  color: #1a1a1a;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.08);
                }
                .header {
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  padding: 40px 30px;
                  text-align: center;
                }
                .header-icon {
                  width: 60px;
                  height: 60px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 50%;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  margin-bottom: 15px;
                  backdrop-filter: blur(10px);
                }
                .header h1 {
                  color: #ffffff;
                  font-size: 28px;
                  font-weight: 600;
                  margin: 0;
                  letter-spacing: -0.5px;
                }
                .content {
                  padding: 40px 30px;
                }
                .asset-info {
                  text-align: center;
                  margin-bottom: 32px;
                  padding-bottom: 32px;
                  border-bottom: 2px solid #f0fdf4;
                }
                .asset-name {
                  font-size: 24px;
                  font-weight: 700;
                  color: #1a1a1a;
                  margin-bottom: 8px;
                }
                .asset-symbol {
                  font-size: 18px;
                  color: #6b7280;
                  font-weight: 500;
                }
                .price-section {
                  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                  padding: 24px;
                  border-radius: 12px;
                  margin-bottom: 24px;
                  text-align: center;
                  border: 2px solid #10b981;
                }
                .current-price {
                  font-size: 42px;
                  font-weight: 700;
                  color: #10b981;
                  margin: 8px 0;
                  letter-spacing: -1px;
                }
                .price-label {
                  font-size: 14px;
                  color: #059669;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .alert-message {
                  text-align: center;
                  font-size: 16px;
                  color: #374151;
                  margin-bottom: 32px;
                  line-height: 1.6;
                }
                .alert-message strong {
                  color: #10b981;
                  font-weight: 600;
                }
                .details {
                  background: #f9fafb;
                  border-radius: 12px;
                  padding: 20px;
                  margin-bottom: 24px;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 12px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .detail-row:last-child {
                  border-bottom: none;
                }
                .detail-label {
                  font-weight: 500;
                  color: #6b7280;
                  font-size: 14px;
                }
                .detail-value {
                  font-weight: 600;
                  color: #1a1a1a;
                  font-size: 14px;
                  text-align: right;
                }
                .button-container {
                  text-align: center;
                  margin: 32px 0;
                }
                .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 15px;
                  transition: transform 0.2s, box-shadow 0.2s;
                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                .disclaimer {
                  background: #f0fdf4;
                  padding: 16px;
                  border-radius: 8px;
                  border-left: 4px solid #10b981;
                  font-size: 13px;
                  color: #374151;
                  line-height: 1.6;
                  margin-top: 24px;
                }
                .footer {
                  text-align: center;
                  padding: 24px 30px;
                  background: #f9fafb;
                  border-top: 1px solid #e5e7eb;
                }
                .footer p {
                  font-size: 12px;
                  color: #9ca3af;
                  margin: 4px 0;
                }
                @media only screen and (max-width: 600px) {
                  body { padding: 10px; }
                  .header { padding: 30px 20px; }
                  .header h1 { font-size: 24px; }
                  .content { padding: 30px 20px; }
                  .current-price { font-size: 36px; }
                  .asset-name { font-size: 20px; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <!-- Header -->
                <div class="header">
                  <div class="header-icon">${direction}</div>
                  <h1>${t.title}</h1>
                </div>

                <!-- Content -->
                <div class="content">
                  <!-- Asset Information -->
                  <div class="asset-info">
                    <div class="asset-name">${alert.assetName}</div>
                    <div class="asset-symbol">${alert.assetSymbol}</div>
                  </div>

                  <!-- Current Price -->
                  <div class="price-section">
                    <div class="price-label">${t.currentPrice}</div>
                    <div class="current-price">${formatPrice(currentPrice)}</div>
                  </div>

                  <!-- Alert Message -->
                  <div class="alert-message">
                    ${alert.assetSymbol} ${alertTypeText} <strong>${formatPrice(alert.targetPrice)}</strong>
                  </div>

                  <!-- Details -->
                  <div class="details">
                    <div class="detail-row">
                      <span class="detail-label">${t.assetType}</span>
                      <span class="detail-value">${assetTypeText}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">${t.alertType}</span>
                      <span class="detail-value">${alertTypeLabelText} ${formatPrice(alert.targetPrice)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">${t.targetPrice}</span>
                      <span class="detail-value">${formatPrice(alert.targetPrice)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">${t.triggeredAt}</span>
                      <span class="detail-value">${new Date().toLocaleString(userLang === 'ka' ? 'ka-GE' : 'en-US')}</span>
                    </div>
                  </div>

                  <!-- Button -->
                  <div class="button-container">
                    <a href="${process.env.CLIENT_URL}/dashboard" class="button">
                      ${t.viewDashboard}
                    </a>
                  </div>

                  <!-- Disclaimer -->
                  <div class="disclaimer">
                    ${t.disclaimer}
                  </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                  <p>${t.footer}</p>
                  <p>&copy; ${new Date().getFullYear()} ${t.copyright}</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email notification sent to ${user.email} for alert ${alert._id} in ${userLang} language`);
    } catch (error) {
      console.error(`Error sending email notification for alert ${alert._id}:`, error);
    }
  }

  // Manually check alerts for a specific user (useful for testing)
  async checkUserAlerts(userId) {
    try {
      const alerts = await PriceAlert.find({
        userId,
        isActive: true,
        triggered: false
      });

      for (const alert of alerts) {
        await this.checkAlertsForAsset(alert.assetType, alert.assetId, [alert]);
      }

      return { message: 'User alerts checked', alertCount: alerts.length };
    } catch (error) {
      console.error('Error checking user alerts:', error);
      throw error;
    }
  }
}

// Create singleton instance
const priceAlertService = new PriceAlertService();

module.exports = priceAlertService;
