# Price Alert Email Design Documentation

## Overview
The price alert email notification system has been redesigned with a **minimalist green aesthetic** and **multi-language support** (English and Georgian).

## Design Features

### Color Scheme
- **Primary Green**: `#10b981` (Emerald 500)
- **Secondary Green**: `#059669` (Emerald 600)
- **Background**: `#f8faf9` (Light green tint)
- **Accents**: `#f0fdf4` and `#dcfce7` (Light green gradients)

### Design Philosophy
- **Minimalist**: Clean, uncluttered layout with ample white space
- **Modern**: Rounded corners, subtle shadows, gradient buttons
- **Responsive**: Mobile-optimized with media queries
- **Professional**: System fonts and proper typography hierarchy

### Key Components

1. **Header**
   - Green gradient background (#10b981 to #059669)
   - Circular icon with direction arrow (↗ for above, ↘ for below)
   - Title: "Price Alert!" / "ფასის შეტყობინება!"

2. **Asset Information**
   - Asset name (large, bold)
   - Asset symbol (gray, medium)
   - Clean separator

3. **Price Section**
   - Large, prominent current price display
   - Green gradient background
   - Border accent in primary green

4. **Alert Message**
   - Clear message: "BTC has risen above $45,000.00"
   - Georgian: "BTC აიწია $45,000.00"

5. **Details Table**
   - Asset Type (Cryptocurrency/Stock)
   - Alert Type
   - Target Price
   - Triggered Date/Time

6. **Call-to-Action Button**
   - Green gradient button
   - "View in Cryptalyst" / "ნახვა Cryptalyst-ში"
   - Shadow effect for depth

7. **Disclaimer**
   - Light green background with left border accent
   - Information about alert being triggered once

8. **Footer**
   - Gray text, minimal
   - Copyright information

## Multi-Language Support

### Supported Languages

1. **English (`en`)** - Default
2. **Georgian (`ka`)**

### Language Detection
The email language is automatically detected from the user's language preference stored in their profile settings:
```javascript
user.settings.language // 'en' or 'ka'
```

### Translation Keys
All translations are stored in `/server/src/utils/emailTranslations.js`:

```javascript
{
  en: { priceAlert: { ... } },
  ka: { priceAlert: { ... } }
}
```

### Adding New Languages
To add a new language:

1. Update the User model enum in `/server/src/models/user.model.js`:
   ```javascript
   language: {
     type: String,
     enum: ['en', 'ka', 'es'], // Add 'es' for Spanish
     default: 'en'
   }
   ```

2. Add translations to `/server/src/utils/emailTranslations.js`:
   ```javascript
   es: {
     priceAlert: {
       subject: 'Alerta de Precio Activada',
       title: '¡Alerta de Precio!',
       // ... add all keys
     }
   }
   ```

## Email Template Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Minimalist green design styles */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">...</div>
      <div class="content">
        <div class="asset-info">...</div>
        <div class="price-section">...</div>
        <div class="alert-message">...</div>
        <div class="details">...</div>
        <div class="button-container">...</div>
        <div class="disclaimer">...</div>
      </div>
      <div class="footer">...</div>
    </div>
  </body>
</html>
```

## User Settings

### Setting Language Preference

Users can set their language preference through the Settings API:

**Endpoint**: `PUT /api/settings/preferences`

**Request Body**:
```json
{
  "language": "ka"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "settings": {
    "language": "ka",
    "currency": "USD",
    "timezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "theme": "system"
  }
}
```

### Frontend Integration

Update the Settings page to include a language selector:

```jsx
<select
  value={settings.language || 'en'}
  onChange={(e) => updatePreference('language', e.target.value)}
>
  <option value="en">English</option>
  <option value="ka">ქართული (Georgian)</option>
</select>
```

## Testing

### Manual Testing

1. **Set up email credentials** in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Set user language** (via API or database):
   ```javascript
   // English
   await User.findByIdAndUpdate(userId, {
     'settings.language': 'en'
   });

   // Georgian
   await User.findByIdAndUpdate(userId, {
     'settings.language': 'ka'
   });
   ```

3. **Create a price alert** that will trigger soon

4. **Wait for the alert to trigger** (service checks every 5 minutes)

5. **Check your email** for the styled notification

### Testing Email Template

To preview the email without triggering a real alert, you can create a test script:

```javascript
// server/test/testEmail.js
const nodemailer = require('nodemailer');
const { getCategoryTranslations } = require('../src/utils/emailTranslations');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const userLang = 'ka'; // Test Georgian
  const t = getCategoryTranslations(userLang, 'priceAlert');

  const mailOptions = {
    from: `"Cryptalyst" <${process.env.EMAIL_USER}>`,
    to: 'your-test-email@example.com',
    subject: `↗ ${t.subject}: BTC`,
    html: `<!-- Copy email HTML from priceAlert.service.js -->`
  };

  await transporter.sendMail(mailOptions);
  console.log('Test email sent!');
}

testEmail();
```

## Email Client Compatibility

The email template has been tested and works with:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Mobile clients (iOS Mail, Android Gmail)

## Accessibility

- Semantic HTML structure
- Adequate color contrast ratios
- Clear typography hierarchy
- Responsive design for all screen sizes

## Future Enhancements

Potential improvements:
1. Add more languages (Spanish, French, German, Russian, etc.)
2. Include asset icon/image in the email
3. Add price chart thumbnail
4. Support for dark mode email clients
5. Personalized greeting with user's name
6. Email preview in browser option
