# Backend OTP Implementation Guide

This guide shows you how to implement OTP verification on the backend using different SMS service providers.

## Overview

Your frontend is already set up to call these API endpoints:
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP for login
- `POST /api/auth/signup-verify-otp` - Verify OTP for signup

## Option 1: AWS SNS (Recommended - Cheapest for Production)

### Setup
1. Create an AWS account
2. Go to AWS SNS (Simple Notification Service)
3. Create an IAM user with SNS permissions
4. Get your Access Key ID and Secret Access Key

### Installation
```bash
npm install @aws-sdk/client-sns
```

### Implementation Example (Node.js/Express)

```javascript
const express = require('express');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const snsClient = new SNSClient({
  region: 'us-east-1', // Change to your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(phone, { otp, expiresAt });

    // Send SMS via AWS SNS
    const params = {
      PhoneNumber: phone,
      Message: `Your OTP code is ${otp}. Valid for 5 minutes.`,
    };

    const command = new PublishCommand(params);
    await snsClient.send(command);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP for login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const stored = otpStore.get(phone);
    
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP verified - find or create user
    otpStore.delete(phone);
    
    // TODO: Find user by phone in your database
    // const user = await User.findOne({ phone });
    
    // For now, return success
    res.json({ 
      success: true,
      user: {
        id: '1',
        phone,
        name: 'User',
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

// Verify OTP for signup
app.post('/api/auth/signup-verify-otp', async (req, res) => {
  try {
    const { phone, name, otp } = req.body;

    const stored = otpStore.get(phone);
    
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP verified - create new user
    otpStore.delete(phone);
    
    // TODO: Create user in your database
    // const user = await User.create({ phone, name, role: 'user' });
    
    res.json({ 
      success: true,
      user: {
        id: Date.now().toString(),
        phone,
        name,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Pricing
- **US SMS**: ~$0.00645 per message
- **International**: Varies by country (check AWS pricing)
- **Free tier**: First 100 SMS/month free (for first 12 months)

---

## Option 2: Twilio (Developer-Friendly)

### Setup
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Get a phone number from Twilio

### Installation
```bash
npm install twilio
```

### Implementation Example

```javascript
const express = require('express');
const twilio = require('twilio');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const otpStore = new Map();

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(phone, { otp, expiresAt });

    await client.messages.create({
      body: `Your OTP code is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.json({ success: true, message: 'OTP sent successfully', expiresIn: 300 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ... (verify endpoints similar to AWS example)
```

### Pricing
- **US SMS**: ~$0.0075 per message
- **International**: Varies by country
- **Free trial**: $15.50 credit for new accounts

---

## Option 3: Firebase Phone Authentication (Easiest Setup)

### Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Phone Authentication
3. Get your Firebase config

### Installation
```bash
npm install firebase-admin
```

### Implementation Example

```javascript
const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Firebase handles OTP sending automatically
// You just need to verify the ID token on the frontend
app.post('/api/auth/verify-firebase-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    res.json({
      success: true,
      user: {
        id: decodedToken.uid,
        phone: decodedToken.phone_number,
        name: decodedToken.name || 'User',
        role: 'user'
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
```

### Pricing
- **Free tier**: 10,000 verifications/month free
- **After free tier**: Pay-as-you-go (varies by country)

---

## Option 4: MessageBird (Good for International)

### Setup
1. Sign up at [messagebird.com](https://www.messagebird.com)
2. Get your API key

### Installation
```bash
npm install messagebird
```

### Implementation Example

```javascript
const express = require('express');
const messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
const crypto = require('crypto');

const app = express();
app.use(express.json());

const otpStore = new Map();

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(phone, { otp, expiresAt });

    messagebird.messages.create({
      originator: 'OTP Service',
      recipients: [phone],
      body: `Your OTP code is ${otp}. Valid for 5 minutes.`
    }, (err, response) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
      }
      res.json({ success: true, message: 'OTP sent successfully', expiresIn: 300 });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});
```

### Pricing
- **US SMS**: ~$0.01 per message
- **International**: Varies by country

---

## Environment Variables

Create a `.env` file:

```env
# AWS SNS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# OR Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OR Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# OR MessageBird
MESSAGEBIRD_API_KEY=your_api_key
```

## Production Recommendations

1. **Use Redis** instead of in-memory Map for OTP storage
2. **Rate limiting**: Limit OTP requests per phone number (e.g., 3 per hour)
3. **Phone number validation**: Use a library like `libphonenumber-js`
4. **Error handling**: Implement proper error logging
5. **Security**: Add CAPTCHA to prevent abuse
6. **Database**: Store users in a proper database (PostgreSQL, MongoDB, etc.)

## Cost Comparison Summary

| Provider | US SMS Cost | Free Tier | Best For |
|----------|-------------|-----------|----------|
| **AWS SNS** | $0.00645 | 100/month (12 months) | Production, scale |
| **Twilio** | $0.0075 | $15.50 credit | Developer-friendly |
| **Firebase** | Varies | 10,000/month | Quick setup |
| **MessageBird** | $0.01 | Trial credits | International |

**Cheapest for production**: AWS SNS
**Easiest to implement**: Firebase
**Best developer experience**: Twilio

Choose based on your needs!

